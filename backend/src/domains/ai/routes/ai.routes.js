import { Router } from "express";
import { processMessage } from "../services/chatbot.service.js";
import auth from "../../../middleware/auth.js";
import Policy from "../../policies/models/Policy.js";
import { analyzeClaimAI } from "../../claims/services/ai-claims.engine.js";

const router = Router();

/* ─── AI Chat (Insurance-only chatbot) ───────────────── */
router.post("/chat", async (req, res, next) => {
    try {
        const { message, history } = req.body;
        if (!message) {
            return res.status(400).json({ message: "message is required" });
        }

        const result = await processMessage(message, history || []);
        res.json(result);
    } catch (err) {
        next(err);
    }
});

/* ─── AI Claim Analysis ──────────────────────────────── */
router.post("/analyze-claim", auth, async (req, res, next) => {
    try {
        const { claimAmount, incidentDate, description, policyId, documents } = req.body;

        if (!policyId) {
            return res.status(400).json({ message: "policyId is required" });
        }

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

