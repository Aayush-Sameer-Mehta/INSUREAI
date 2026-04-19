import { Router } from "express";
import auth from "../../../middleware/auth.js";
import validate from "../../../middleware/validate.js";
import { recommendationV2Schema } from "../../../validators/advanced.validators.js";
import { calculateCustomerRiskScore } from "../services/risk.engine.js";
import {
    buildRecommendationExplanation,
    getRankedRecommendations,
} from "../services/recommendation.engine.js";
import { ok } from "../../shared/services/response.js";

const router = Router();

/* ─── Advanced AI Recommendations (Consolidated V2) ─── */
router.post("/personalized", auth, validate(recommendationV2Schema), async (req, res, next) => {
    try {
        const profile = req.body;
        const aiWeight = req.user.role === "AGENT" ? 0.6 : 0.85;
        const agentScore = Number(profile.agentScore || 0);

        const riskProfile = calculateCustomerRiskScore({
            age: profile.age,
            occupation: profile.occupation,
            occupationRiskClass: profile.riskProfile === "High" ? "High" : profile.riskProfile === "Low" ? "Low" : "Moderate",
            healthConditions: profile.healthConditions,
            smoking: profile.smoking,
            claimHistory: profile.claimHistory,
            drivingHistory: profile.drivingHistory,
        });

        const recommendations = await getRankedRecommendations(profile, riskProfile);
        const explanation = await buildRecommendationExplanation(profile, riskProfile, recommendations);
        const aiScore = Math.min(100, Math.max(0, Math.round(riskProfile.score)));
        const finalRecommendationScore = Math.min(
            100,
            Math.max(
                0,
                Number((aiScore * aiWeight + agentScore * (1 - aiWeight)).toFixed(2)),
            ),
        );
        const recommendationSource =
            req.user.role === "AGENT" && agentScore > 0 ? "Hybrid" : "AI";

        return ok(res, {
            riskProfile,
            riskScore: riskProfile.score,
            riskLevel: riskProfile.category.replace(" Risk", ""),
            explanation,
            recommendations,
            ai_score: aiScore,
            agent_score: agentScore,
            final_recommendation_score: finalRecommendationScore,
            recommendation_source: recommendationSource,
        }, {
            totalRecommendations: recommendations.length,
        });
    } catch (err) {
        return next(err);
    }
});

export default router;
