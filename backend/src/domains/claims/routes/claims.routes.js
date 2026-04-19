import { Router } from "express";
import auth from "../../../middleware/auth.js";
import authorize from "../../../middleware/authorize.js";
import AppError from "../../../utils/AppError.js";
import Claim from "../models/Claim.js";
import Policy from "../../policies/models/Policy.js";
import Document from "../models/Document.js";
import User from "../../users/models/User.js";
import validate from "../../../middleware/validate.js";
import { claimCreateV2Schema, claimDocumentSchema } from "../../../validators/advanced.validators.js";
import { createClaimWithFraudAssessment } from "../services/claims.service.js";
import { uploadDocument } from "../../documents/services/storage.adapter.js";
import { ok, fail } from "../../shared/services/response.js";
import { ERROR_CODES } from "../../shared/services/error-codes.js";
import { createNotification } from "../../notifications/services/notification.service.js";
import upload from "../../../middleware/upload.js";

const router = Router();

router.use(auth);

router.post("/upload", upload.array("documents", 5), async (req, res, next) => {
    try {
        if (!req.files || req.files.length === 0) {
            return fail(res, "No files uploaded", ERROR_CODES.VALIDATION_ERROR, 400);
        }

        const filesInfo = req.files.map(file => ({
            originalName: file.originalname,
            filename: file.filename,
            path: `/uploads/${file.filename}`,
            size: file.size,
            mimetype: file.mimetype
        }));

        return ok(res, { files: filesInfo }, {}, 200);
    } catch (err) {
        return next(err);
    }
});

router.post("/", authorize(["USER", "AGENT", "ADMIN"]), validate(claimCreateV2Schema), async (req, res, next) => {
    try {
        const {
            policyId,
            claimAmount,
            reason,
            incidentDate,
            documents,
            hospitalDetails,
            payoutBankDetails,
            userId,
            agentId,
            agentAssisted,
        } = req.body;

        let claimUserId = req.user._id;
        let claimOwner = req.user;
        if (req.user.role !== "USER" && userId) {
            const customer = await User.findOne({ _id: userId, role: "USER" });
            if (!customer) {
                return next(new AppError("Customer not found", 404));
            }
            claimUserId = customer._id;
            claimOwner = customer;
        }

        const policy =
            (await Policy.findOne({ policyId })) ||
            (await Policy.findById(policyId).catch(() => null));

        if (!policy) {
            return next(new AppError("Policy not found", 404));
        }

        const claimFrequency = await Claim.countDocuments({ user: claimUserId });
        const resolvedAgentId =
            req.user.role === "AGENT"
                ? req.user._id
                : agentId || req.user.user_profile?.assigned_agent_id || null;
        const { claim, fraud } = await createClaimWithFraudAssessment({
            userId: claimUserId,
            policy,
            payload: {
                claimAmount,
                reason,
                incidentDate,
                documents,
                geoLocation: req.body.geoLocation,
                locationMismatch: req.body.locationMismatch,
                incidentWithin24h: req.body.incidentWithin24h,
                hospitalDetails,
                payoutBankDetails,
                agent_id: resolvedAgentId,
                handled_by_agent: Boolean(resolvedAgentId),
                agent_assisted: Boolean(agentAssisted ?? resolvedAgentId),
                approval_status: "Pending",
            },
            claimFrequency,
        });

        try {
            await createNotification({
                userId: claimUserId,
                title: "Claim submitted",
                message: `Claim ${claim.claimId} has been submitted and is under processing.`,
                type: "claim",
                entityType: "claim",
                entityId: claim.claimId,
                channels: { inApp: true, email: true, sms: false },
                emailTo: claimOwner.email,
            });
        } catch {
            // non-blocking
        }

        return ok(res, { claim, fraud }, {}, 201);
    } catch (err) {
        next(err);
    }
});

router.post("/:id/documents", validate(claimDocumentSchema), async (req, res, next) => {
    try {
        const claim =
            (await Claim.findOne({
                claimId: req.params.id,
                $or: [{ user: req.user._id }, { agent_id: req.user._id }],
            })) ||
            (await Claim.findOne({
                _id: req.params.id,
                $or: [{ user: req.user._id }, { agent_id: req.user._id }],
            }).catch(() => null));

        if (!claim) {
            return fail(res, "Claim not found", ERROR_CODES.NOT_FOUND, 404);
        }

        const upload = await uploadDocument(req.body);
        const duplicate = await Document.findOne({ checksum: upload.checksum, owner: req.user._id });

        const doc = await Document.create({
            documentType: req.body.documentType,
            owner: req.user._id,
            claim: claim._id,
            policy: claim.policy,
            fileName: req.body.fileName,
            fileSize: req.body.fileSize,
            mimeType: req.body.mimeType,
            checksum: upload.checksum,
            storageProvider: upload.provider,
            storageKey: upload.storageKey,
            publicUrl: upload.publicUrl,
            isDuplicate: Boolean(duplicate),
        });

        claim.documentRefs.push(doc._id);
        if (doc.isDuplicate) {
            claim.fraudSignals.push("Duplicate document detected");
            claim.fraudRiskScore = Math.min(100, (claim.fraudRiskScore || 0) + 10);
            claim.fraudRiskLevel = claim.fraudRiskScore >= 70
                ? "High Risk"
                : claim.fraudRiskScore >= 40
                    ? "Medium Risk"
                    : "Low Risk";
            claim.requiresFraudReview = claim.fraudRiskLevel === "High Risk";
        }
        await claim.save();

        return ok(res, doc, {}, 201);
    } catch (err) {
        return next(err);
    }
});

router.get("/:id/timeline", async (req, res, next) => {
    try {
        const claim =
            (await Claim.findOne({
                claimId: req.params.id,
                $or: [{ user: req.user._id }, { agent_id: req.user._id }],
            }).lean()) ||
            (await Claim.findOne({
                _id: req.params.id,
                $or: [{ user: req.user._id }, { agent_id: req.user._id }],
            }).lean().catch(() => null));
        if (!claim) {
            return fail(res, "Claim not found", ERROR_CODES.NOT_FOUND, 404);
        }

        return ok(res, {
            claimId: claim.claimId,
            status: claim.status,
            approvalStatus: claim.approval_status,
            paymentState: claim.paymentState,
            fraudRiskScore: claim.fraudRiskScore,
            fraudRiskLevel: claim.fraudRiskLevel,
            timeline: claim.workflowTimeline || [],
        });
    } catch (err) {
        return next(err);
    }
});

router.get("/my", async (req, res, next) => {
    try {
        const filter =
            req.user.role === "AGENT"
                ? { agent_id: req.user._id }
                : { user: req.user._id };

        const claims = await Claim.find(filter)
            .populate("policy", "policyId name company category price coverage")
            .populate("user", "fullName email")
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (err) {
        next(err);
    }
});

export default router;
