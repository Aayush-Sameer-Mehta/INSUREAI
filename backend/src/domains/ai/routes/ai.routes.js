import { Router } from "express";
import { processMessage } from "../services/chatbot.service.js";
import auth from "../../../middleware/auth.js";
import Policy from "../../policies/models/Policy.js";
import { analyzeClaimAI } from "../../claims/services/ai-claims.engine.js";
import validate from "../../../middleware/validate.js";
import { aiAnalyzeClaimSchema, aiChatSchema } from "../../../validators/advanced.validators.js";

const router = Router();

/* ─── AI Chat (Insurance-only chatbot) ───────────────── */
router.post("/chat", auth, validate(aiChatSchema), async (req, res, next) => {
    try {
        const { message, history } = req.body;
        // Bound history to reduce cost/abuse.
        const boundedHistory = Array.isArray(history) ? history.slice(-20) : [];
        const result = await processMessage(message, boundedHistory);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/* ─── AI Claim Analysis ──────────────────────────────── */
router.post("/analyze-claim", auth, validate(aiAnalyzeClaimSchema), async (req, res, next) => {
    try {
        const { claimAmount, incidentDate, description, policyId, documents } = req.body;

        const policy =
            (await Policy.findOne({ policyId })) ||
            (await Policy.findById(policyId).catch(() => null));

        if (!policy) {
            return res.status(404).json({ message: "Policy not found" });
        }

        const analysis = await analyzeClaimAI({
            claimAmount: Number(claimAmount || 0),
            incidentDate,
            description,
            policyId,
            policyCoverage: policy.coverage,
            policyCategory: policy.category,
            documents: documents || [],
            userId: req.user._id,
        });

        res.json(analysis);
    } catch (err) {
        next(err);
    }
});

export default router;

