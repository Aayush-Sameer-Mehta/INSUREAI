import { Router } from "express";
import auth from "../../../middleware/auth.js";
import authorize from "../../../middleware/authorize.js";
import AppError from "../../../utils/AppError.js";
import Policy from "../../policies/models/Policy.js";
import User from "../../users/models/User.js";
import Claim from "../../claims/models/Claim.js";
import Payment from "../../payments/models/Payment.js";
import FraudReview from "../../claims/models/FraudReview.js";
import { getAnalyticsV2, getPremiumAnalytics } from "../../analytics/services/analytics.service.js";
import { createNotification } from "../../notifications/services/notification.service.js";
import { buildAdminDashboard } from "../../analytics/services/dashboard.service.js";
import { isValidRole, normalizeRole, ROLES } from "../../../utils/roles.js";

const router = Router();

router.use(auth, authorize(["ADMIN"]));

async function resolvePolicy(identifier) {
    return (
        (await Policy.findOne({ policyId: identifier })) ||
        (await Policy.findById(identifier).catch(() => null))
    );
}

/* ─── Policy Management (CRUD) ───────────────────────── */
router.get("/policies", async (_req, res, next) => {
    try {
        const policies = await Policy.find().sort({ createdAt: -1 });
        res.json(policies);
    } catch (err) {
        next(err);
    }
});

router.post("/policies", async (req, res, next) => {
    try {
        const policy = await Policy.create(req.body);
        res.status(201).json(policy);
    } catch (err) {
        next(err);
    }
});

router.put("/policies/:id", async (req, res, next) => {
    try {
        const policy = await resolvePolicy(req.params.id);
        if (!policy) {
            return next(new AppError("Policy not found", 404));
        }

        Object.assign(policy, req.body);
        await policy.save();

        res.json(policy);
    } catch (err) {
        next(err);
    }
});

router.delete("/policies/:id", async (req, res, next) => {
    try {
        const policy = await resolvePolicy(req.params.id);
        if (!policy) {
            return next(new AppError("Policy not found", 404));
        }

        await Policy.deleteOne({ _id: policy._id });
        res.json({ success: true, message: "Policy deleted successfully" });
    } catch (err) {
        next(err);
    }
});

/* ─── User Management ─────────────────────────────────── */
router.get("/users", async (_req, res, next) => {
    try {
        const users = await User.find()
            .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
            .sort({ createdAt: -1 });
        res.json(users);
    } catch (err) {
        next(err);
    }
});

router.patch("/users/:id/block", async (req, res, next) => {
    try {
        const { blocked, reason } = req.body;
        if (typeof blocked !== "boolean") {
            return next(new AppError("blocked must be a boolean", 400));
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        if (user._id.toString() === req.user._id.toString() && blocked) {
            return next(new AppError("Admin cannot block their own account", 400));
        }

        user.isBlocked = blocked;
        user.blockedAt = blocked ? new Date() : undefined;
        user.blockReason = blocked ? reason || "" : "";
        await user.save({ validateBeforeSave: false });

        res.json({
            success: true,
            message: blocked ? "User blocked successfully" : "User unblocked successfully",
            user,
        });
    } catch (err) {
        next(err);
    }
});

router.patch("/users/:id/role", async (req, res, next) => {
    try {
        const nextRole = normalizeRole(req.body?.role);
        if (!isValidRole(nextRole)) {
            return next(new AppError(`role must be one of: ${Object.values(ROLES).join(", ")}`, 400));
        }

        const user = await User.findById(req.params.id);
        if (!user) {
            return next(new AppError("User not found", 404));
        }

        if (user._id.toString() === req.user._id.toString() && nextRole !== ROLES.ADMIN) {
            return next(new AppError("Admin cannot change their own role", 400));
        }

        const previousRole = normalizeRole(user.role);

        // Update on document + save to ensure model hooks run
        // and the persisted role is guaranteed in MongoDB.
        user.role = nextRole;

        if (nextRole !== ROLES.AGENT) {
            user.agent_details = {
                license_number: undefined,
                commission_percentage: 0,
                region: "Pan-India",
                total_commission_earned: 0,
            };
        }

        if (nextRole !== ROLES.ADMIN) {
            user.admin_permissions = [];
        }

        await user.save();

        const updatedUser = await User.findById(user._id).select(
            "-password -refreshToken -passwordResetToken -passwordResetExpires",
        );

        if (!updatedUser || normalizeRole(updatedUser.role) !== nextRole) {
            return next(new AppError("Role update was not persisted. Please retry.", 500));
        }

        res.json({
            success: true,
            message: `User role updated to ${nextRole}`,
            previousRole,
            user: updatedUser,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Claims Management ───────────────────────────────── */
router.get("/claims", async (req, res, next) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const claims = await Claim.find(filter)
            .populate("user", "fullName email isBlocked")
            .populate("policy", "policyId name company category")
            .sort({ createdAt: -1 });

        res.json(claims);
    } catch (err) {
        next(err);
    }
});

router.patch("/claims/:id/status", async (req, res, next) => {
    try {
        const { status, adminRemarks } = req.body;
        const allowed = ["Submitted", "Under Review", "Approved", "Rejected", "Paid"];
        if (!allowed.includes(status)) {
            return next(new AppError(`status must be one of: ${allowed.join(", ")}`, 400));
        }

        const claim =
            (await Claim.findOne({ claimId: req.params.id })) ||
            (await Claim.findById(req.params.id).catch(() => null));

        if (!claim) {
            return next(new AppError("Claim not found", 404));
        }

        claim.status = status;
        claim.approval_status = status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : "Pending";
        if (status === "Paid") {
            claim.paymentState = "Paid";
        }
        claim.workflowTimeline.push({
            status,
            note: adminRemarks || `Status updated to ${status}`,
            actor: req.user._id,
            at: new Date(),
        });
        claim.adminRemarks = adminRemarks || "";
        claim.reviewedBy = req.user._id;
        claim.reviewedAt = new Date();
        await claim.save();

        const populated = await claim.populate([
            { path: "user", select: "fullName email" },
            { path: "policy", select: "policyId name company" },
            { path: "agent_id", select: "fullName email role" },
            { path: "reviewedBy", select: "fullName email role" },
        ]);

        res.json(populated);

        try {
            await createNotification({
                userId: claim.user,
                title: `Claim ${status}`,
                message: `Your claim ${claim.claimId} is now ${status}.`,
                type: "claim",
                entityType: "claim",
                entityId: claim.claimId,
                channels: { inApp: true, email: true, sms: false },
            });
        } catch {
            // non-blocking
        }
    } catch (err) {
        next(err);
    }
});

/* ─── Fraud Review Panel Action ─────────────────────── */
router.patch("/claims/:id/review", async (req, res, next) => {
    try {
        const { decision, status, adminRemarks = "" } = req.body;
        const claim =
            (await Claim.findOne({ claimId: req.params.id })) ||
            (await Claim.findById(req.params.id).catch(() => null));
        if (!claim) {
            return next(new AppError("Claim not found", 404));
        }

        const fraudReview = await FraudReview.findOne({ claim: claim._id });
        if (!fraudReview) {
            return next(new AppError("Fraud review record not found for this claim", 404));
        }

        if (decision === "clear") {
            fraudReview.status = "Cleared";
            claim.requiresFraudReview = false;
        } else if (decision === "reject") {
            fraudReview.status = "Rejected";
            claim.status = "Rejected";
            claim.approval_status = "Rejected";
        } else {
            fraudReview.status = "Escalated";
        }

        fraudReview.reviewedBy = req.user._id;
        fraudReview.reviewedAt = new Date();
        fraudReview.notes = adminRemarks;

        if (status && ["Submitted", "Under Review", "Approved", "Rejected", "Paid"].includes(status)) {
            claim.status = status;
            claim.approval_status = status === "Approved" ? "Approved" : status === "Rejected" ? "Rejected" : claim.approval_status;
            if (status === "Paid") claim.paymentState = "Paid";
            claim.workflowTimeline.push({
                status,
                note: adminRemarks || `Fraud review decision: ${decision || "updated"}`,
                actor: req.user._id,
                at: new Date(),
            });
        }

        claim.reviewedBy = req.user._id;
        claim.reviewedAt = new Date();
        claim.adminRemarks = adminRemarks;

        await fraudReview.save();
        await claim.save();

        const payload = await Claim.findById(claim._id)
            .populate("user", "fullName email")
            .populate("policy", "policyId name company category")
            .populate("agent_id", "fullName email role");

        res.json({
            claim: payload,
            fraudReview,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Single User Detail ──────────────────────────────── */
router.get("/users/:id", async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id)
            .select("-password -refreshToken -passwordResetToken -passwordResetExpires")
            .populate("purchasedPolicies.policy", "policyId name company category price coverage ratingAverage");
        if (!user) {
            return next(new AppError("User not found", 404));
        }
        res.json(user);
    } catch (err) {
        next(err);
    }
});

/* ─── Single Claim Detail ─────────────────────────────── */
router.get("/claims/:id", async (req, res, next) => {
    try {
        const claim =
            (await Claim.findOne({ claimId: req.params.id })) ||
            (await Claim.findById(req.params.id).catch(() => null));

        if (!claim) {
            return next(new AppError("Claim not found", 404));
        }

        const populated = await claim.populate([
            { path: "user", select: "fullName email mobileNumber city state isBlocked" },
            { path: "policy", select: "policyId name company category price coverage" },
            { path: "agent_id", select: "fullName email role" },
            { path: "reviewedBy", select: "fullName email role" },
            { path: "documentRefs", select: "documentType publicUrl verificationStatus isDuplicate createdAt" },
        ]);

        res.json(populated);
    } catch (err) {
        next(err);
    }
});

/* ─── Payment History ─────────────────────────────────── */
router.get("/payments", async (req, res, next) => {
    try {
        const payments = await Payment.find()
            .populate("user_id", "fullName email")
            .populate("policy_id", "policyId name company category price")
            .populate("agent_id", "fullName email")
            .sort({ createdAt: -1 })
            .lean();

        res.json(payments);
    } catch (err) {
        next(err);
    }
});

/* ─── Analytics Dashboard ─────────────────────────────── */
router.get("/dashboard", async (_req, res, next) => {
    try {
        const adminSummary = await buildAdminDashboard();
        const [userStats] = await User.aggregate([
            {
                $group: {
                    _id: null,
                    totalUsers: { $sum: 1 },
                    totalAgents: {
                        $sum: { $cond: [{ $eq: ["$role", "AGENT"] }, 1, 0] },
                    },
                    totalAdmins: {
                        $sum: { $cond: [{ $eq: ["$role", "ADMIN"] }, 1, 0] },
                    },
                    blockedUsers: {
                        $sum: { $cond: [{ $eq: ["$isBlocked", true] }, 1, 0] },
                    },
                    totalPoliciesSold: {
                        $sum: { $size: { $ifNull: ["$purchasedPolicies", []] } },
                    },
                    revenue: {
                        $sum: {
                            $sum: {
                                $map: {
                                    input: { $ifNull: ["$purchasedPolicies", []] },
                                    as: "purchase",
                                    in: { $ifNull: ["$$purchase.amount", 0] },
                                },
                            },
                        },
                    },
                },
            },
        ]);

        const mostRecommendedPolicies = await Policy.aggregate([
            { $sort: { score: -1, ratingAverage: -1, reviewsCount: -1 } },
            { $limit: 5 },
            {
                $project: {
                    _id: 1,
                    policyId: 1,
                    name: 1,
                    company: 1,
                    category: 1,
                    score: 1,
                    ratingAverage: 1,
                    reviewsCount: 1,
                },
            },
        ]);

        const [claimStats] = await Claim.aggregate([
            {
                $group: {
                    _id: null,
                    totalClaims: { $sum: 1 },
                    approvedClaims: {
                        $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
                    },
                    rejectedClaims: {
                        $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
                    },
                    underReviewClaims: {
                        $sum: { $cond: [{ $eq: ["$status", "Under Review"] }, 1, 0] },
                    },
                    submittedClaims: {
                        $sum: { $cond: [{ $eq: ["$status", "Submitted"] }, 1, 0] },
                    },
                },
            },
        ]);

        const totalClaims = claimStats?.totalClaims || 0;
        const approvedClaims = claimStats?.approvedClaims || 0;
        const claimApprovalRatio = totalClaims
            ? Number(((approvedClaims / totalClaims) * 100).toFixed(2))
            : 0;

        res.json({
            roleSummary: adminSummary.usersByRole,
            totalUsers: userStats?.totalUsers || 0,
            totalAgents: userStats?.totalAgents || 0,
            totalAdmins: userStats?.totalAdmins || 0,
            blockedUsers: userStats?.blockedUsers || 0,
            totalPoliciesSold: userStats?.totalPoliciesSold || 0,
            revenueSummary: {
                totalRevenue: adminSummary.payments.totalPremium || userStats?.revenue || 0,
                totalCommission: adminSummary.payments.totalCommission || 0,
                currency: "INR",
            },
            mostRecommendedPolicies,
            claims: {
                totalClaims,
                approvedClaims,
                rejectedClaims: claimStats?.rejectedClaims || 0,
                underReviewClaims: claimStats?.underReviewClaims || 0,
                submittedClaims: claimStats?.submittedClaims || 0,
                claimApprovalRatio,
            },
        });
    } catch (err) {
        next(err);
    }
});

router.get("/analytics/v2", async (_req, res, next) => {
    try {
        const analytics = await getAnalyticsV2();
        res.json(analytics);
    } catch (err) {
        next(err);
    }
});

router.get("/analytics/premium", async (req, res, next) => {
    try {
        const { startDate, endDate, category, paymentStatus } = req.query;
        const analytics = await getPremiumAnalytics({ startDate, endDate, category, paymentStatus });
        res.json(analytics);
    } catch (err) {
        next(err);
    }
});

router.get("/analytics/premium/export", async (req, res, next) => {
    try {
        const { startDate, endDate, category, paymentStatus } = req.query;
        const analytics = await getPremiumAnalytics({ startDate, endDate, category, paymentStatus });

        // Generate CSV content
        let csv = "Purchase ID,Policy Name,Company,Category,Amount,Payment Status,Purchased At\n";

        for (const record of analytics.recentlyPurchased) {
            const row = [
                record._id,
                `"${record.policyName}"`,
                `"${record.company}"`,
                record.category,
                record.amount,
                record.paymentStatus,
                record.purchasedAt
            ].join(",");
            csv += row + "\n";
        }

        res.setHeader("Content-Type", "text/csv");
        res.setHeader("Content-Disposition", "attachment; filename=premium_purchases.csv");
        res.status(200).send(csv);
    } catch (err) {
        next(err);
    }
});

export default router;
