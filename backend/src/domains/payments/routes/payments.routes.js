import { Router } from "express";
import crypto from "crypto";
import auth from "../../../middleware/auth.js";
import authorize from "../../../middleware/authorize.js";
import Policy from "../../policies/models/Policy.js";
import User from "../../users/models/User.js";
import Payment from "../models/Payment.js";
import validate from "../../../middleware/validate.js";
import AppError from "../../../utils/AppError.js";
import { paymentCreateOrderSchema, paymentVerifySchema } from "../../../validators/advanced.validators.js";
import { createOrder, verifyPayment } from "../services/razorpay.adapter.js";
import { createNotification } from "../../notifications/services/notification.service.js";
import { generatePolicyDocument } from "../../reports/services/policy-document.service.js";
import { scheduleRenewalRemindersForUser } from "../../notifications/services/reminder.service.js";
import { ok, fail } from "../../shared/services/response.js";
import { ERROR_CODES } from "../../shared/services/error-codes.js";
import { recordPolicyPurchase } from "../services/purchase.service.js";

const router = Router();

async function resolveCustomerActor(req, userId) {
    if (req.user.role === "USER" || !userId) {
        return req.user;
    }

    const customer = await User.findOne({ _id: userId, role: "USER" });
    if (!customer) {
        throw new AppError("Customer not found", 404);
    }

    if (
        req.user.role === "AGENT" &&
        String(customer.user_profile?.assigned_agent_id || "") !== String(req.user._id)
    ) {
        throw new AppError("Agents can only complete purchases for assigned customers", 403);
    }

    return customer;
}

/* ─── Simulated payment intent ───────────────────────── */
router.post("/create-intent", auth, authorize(["USER", "AGENT", "ADMIN"]), async (req, res, next) => {
    try {
        const { policyId } = req.body;
        if (!policyId) {
            return res.status(400).json({ message: "policyId is required" });
        }

        // Generate a mock client secret (simulating Stripe-like flow)
        const clientSecret = `pi_${crypto.randomBytes(16).toString("hex")}_secret_${crypto.randomBytes(8).toString("hex")}`;

        res.json({
            clientSecret,
            policyId,
            status: "requires_payment_method",
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Create payment order (adapter-first) ───────────── */
router.post("/create-order", auth, authorize(["USER", "AGENT", "ADMIN"]), validate(paymentCreateOrderSchema), async (req, res, next) => {
    try {
        const { policyId, amount, userId } = req.body;
        const policy =
            (await Policy.findOne({ policyId })) ||
            (await Policy.findById(policyId).catch(() => null));
        if (!policy) {
            return fail(res, "Policy not found", ERROR_CODES.NOT_FOUND, 404);
        }

        const customer = await resolveCustomerActor(req, userId);

        const order = await createOrder({
            amount: Number(amount || policy.price),
            currency: "INR",
            receipt: `rcpt_${Date.now()}`,
        });

        return ok(res, {
            order,
            customer: { id: customer._id, email: customer.email, fullName: customer.fullName },
            policy: { id: policy.policyId || policy._id, name: policy.name, amount: policy.price },
        });
    } catch (err) {
        return next(err);
    }
});

/* ─── Confirm payment & purchase policy ──────────────── */
router.post("/confirm", auth, authorize(["USER", "AGENT", "ADMIN"]), async (req, res, next) => {
    try {
        const {
            policyId,
            paymentMethod,
            agentId,
            userId,
            autoRenewalFlag,
            recommendation = {},
        } = req.body;
        if (!policyId) {
            return res.status(400).json({ message: "policyId is required" });
        }

        // Find policy – support both policyId string and MongoDB _id
        const policy =
            (await Policy.findOne({ policyId })) ||
            (await Policy.findById(policyId).catch(() => null));

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        const customer = await resolveCustomerActor(req, userId);

        // Check if already purchased
        const alreadyPurchased = customer.purchasedPolicies.some(
            (p) => p.policy.toString() === policy._id.toString()
        );
        if (alreadyPurchased) {
            return res.status(400).json({ message: "Policy already purchased" });
        }

        // Generate confirmation ID
        const confirmationId = `PAY-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

        const purchaseResult = await recordPolicyPurchase({
            user: customer,
            policy,
            paymentReference: confirmationId,
            paymentMethod: paymentMethod || "upi",
            paymentStatus: "Paid",
            requestedAgentId: req.user.role === "AGENT" ? req.user._id : agentId,
            recommendation,
            autoRenewalFlag,
        });
        await scheduleRenewalRemindersForUser(customer);

        const populated = await customer.populate("purchasedPolicies.policy");

        res.status(201).json({
            message: "Payment successful",
            confirmationId,
            paymentMethod: paymentMethod || "upi",
            policy: {
                id: policy.policyId || policy._id,
                name: policy.name,
                price: policy.price,
            },
            user: populated,
            payment: purchaseResult.payment,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Renewal payment for existing purchase ─────────── */
router.post("/renew", auth, authorize(["USER", "AGENT", "ADMIN"]), async (req, res, next) => {
    try {
        const {
            purchaseId,
            policyId,
            amount,
            paymentMethod = "upi",
            userId,
            autoRenewalFlag,
        } = req.body;

        const customer = await resolveCustomerActor(req, userId);
        if (!purchaseId && !policyId) {
            return fail(res, "purchaseId or policyId is required", ERROR_CODES.VALIDATION_FAILED, 400);
        }

        const purchase = purchaseId
            ? customer.purchasedPolicies.id(purchaseId)
            : customer.purchasedPolicies.find(
                (item) => String(item.policy) === String(policyId),
            );

        if (!purchase) {
            return fail(res, "Purchased policy not found for renewal", ERROR_CODES.NOT_FOUND, 404);
        }

        const policy =
            (await Policy.findOne({ policyId })) ||
            (await Policy.findById(purchase.policy).catch(() => null));
        if (!policy) {
            return fail(res, "Policy not found", ERROR_CODES.NOT_FOUND, 404);
        }

        const renewalAmount = Number(amount || policy.price || purchase.amount || 0);
        const now = new Date();
        const currentValidTo = purchase.validTo ? new Date(purchase.validTo) : null;
        const nextValidFrom = currentValidTo && currentValidTo > now ? currentValidTo : now;
        const nextValidTo = new Date(nextValidFrom);
        nextValidTo.setFullYear(nextValidTo.getFullYear() + 1);
        const paymentReference = `RENEW-${crypto.randomBytes(6).toString("hex").toUpperCase()}`;

        purchase.amount = renewalAmount;
        purchase.purchasedAt = now;
        purchase.validFrom = nextValidFrom;
        purchase.validTo = nextValidTo;
        purchase.paymentMethod = paymentMethod;
        purchase.paymentReference = paymentReference;
        purchase.paymentStatus = "Paid";
        purchase.renewal_status = "Completed";
        purchase.auto_renewal_flag = Boolean(autoRenewalFlag ?? purchase.auto_renewal_flag);

        await customer.save();

        const payment = await Payment.create({
            user_id: customer._id,
            policy_id: policy._id,
            agent_id: purchase.agent_id || null,
            premium_amount: renewalAmount,
            payment_method: paymentMethod,
            payment_reference: paymentReference,
            payment_status: "Paid",
            commission_percentage: Number(purchase.commission_percentage || 0),
            commission_amount: Number(purchase.commission_amount || 0),
            commission_status: purchase.agent_id ? "Pending" : "Paid",
            renewal_agent_id: purchase.renewal_agent_id || purchase.agent_id || null,
            auto_renewal_flag: Boolean(autoRenewalFlag ?? purchase.auto_renewal_flag),
            renewal_status: "Completed",
            ai_score: Number(purchase.ai_score || 0),
            agent_score: Number(purchase.agent_score || 0),
            final_recommendation_score: Number(purchase.final_recommendation_score || 0),
            recommendation_source: purchase.recommendation_source || "AI",
        });

        await scheduleRenewalRemindersForUser(customer);

        try {
            await createNotification({
                userId: customer._id,
                title: "Policy renewed successfully",
                message: `${policy.name} renewed. Coverage valid till ${nextValidTo.toLocaleDateString("en-IN")}.`,
                type: "renewal",
                entityType: "policy",
                entityId: policy._id,
                channels: { inApp: true, email: true, sms: true },
                emailTo: customer.email,
                smsTo: customer.mobileNumber,
            });
        } catch {
            // non-blocking
        }

        return ok(res, {
            message: "Renewal payment completed successfully.",
            paymentReference,
            policy: {
                id: policy.policyId || policy._id,
                name: policy.name,
            },
            renewal: {
                purchaseId: purchase._id,
                validFrom: nextValidFrom,
                validTo: nextValidTo,
            },
            payment,
        }, {}, 201);
    } catch (err) {
        return next(err);
    }
});

/* ─── Verify payment + purchase ──────────────────────── */
router.post("/verify", auth, authorize(["USER", "AGENT", "ADMIN"]), validate(paymentVerifySchema), async (req, res, next) => {
    try {
        const {
            policyId,
            orderId,
            paymentId,
            signature,
            paymentMethod,
            userId,
            agentId,
            autoRenewalFlag,
            recommendation = {},
        } = req.body;
        const policy =
            (await Policy.findOne({ policyId })) ||
            (await Policy.findById(policyId).catch(() => null));
        if (!policy) {
            return fail(res, "Policy not found", ERROR_CODES.NOT_FOUND, 404);
        }

        const customer = await resolveCustomerActor(req, userId);

        const alreadyPurchased = customer.purchasedPolicies.some(
            (p) => p.policy.toString() === policy._id.toString()
        );
        if (alreadyPurchased) {
            return fail(res, "Policy already purchased", ERROR_CODES.CONFLICT, 409);
        }

        const verification = await verifyPayment({ orderId, paymentId, signature });
        if (!verification.verified) {
            return fail(res, "Payment verification failed", ERROR_CODES.PAYMENT_FAILED, 400);
        }

        const validFrom = new Date();
        const validTo = new Date(validFrom);
        validTo.setFullYear(validTo.getFullYear() + 1);

        const policyNumber = `POL-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000).toString().padStart(3, "0")}`;
        const generated = await generatePolicyDocument({
            policyNumber,
            user: req.user,
            policy,
            premiumAmount: policy.price,
            validFrom,
            validTo,
        });

        const purchaseResult = await recordPolicyPurchase({
            user: customer,
            policy,
            paymentReference: paymentId,
            paymentMethod,
            paymentStatus: "Paid",
            policyDocumentPath: generated.filePath,
            requestedAgentId: req.user.role === "AGENT" ? req.user._id : agentId,
            recommendation: {
                ...recommendation,
                validFrom,
                validTo,
            },
            autoRenewalFlag,
        });
        await scheduleRenewalRemindersForUser(customer);

        await createNotification({
            userId: customer._id,
            title: "Policy purchase confirmed",
            message: `${policy.name} purchased successfully. Policy number: ${policyNumber}.`,
            type: "purchase",
            entityType: "policy",
            entityId: policy._id,
            channels: { inApp: true, email: true, sms: true },
            emailTo: customer.email,
            smsTo: customer.mobileNumber,
        });

        return ok(res, {
            policyNumber,
            paymentReference: paymentId,
            paymentMethod,
            policyDocument: generated.fileName,
            policy: { id: policy.policyId || policy._id, name: policy.name, price: policy.price },
            payment: purchaseResult.payment,
        }, {}, 201);
    } catch (err) {
        return next(err);
    }
});

export default router;

