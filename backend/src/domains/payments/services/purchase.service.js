import Payment from "../models/Payment.js";
import User from "../../users/models/User.js";

function clampScore(value) {
  return Math.max(0, Math.min(100, Number(value || 0)));
}

export async function resolveAgentForPurchase({
  requestedAgentId,
  fallbackAgentId,
}) {
  const candidateId = requestedAgentId || fallbackAgentId;
  if (!candidateId) return null;

  const agent = await User.findOne({
    _id: candidateId,
    role: "AGENT",
    is_active: true,
    isBlocked: false,
  });

  return agent || null;
}

export async function recordPolicyPurchase({
  user,
  policy,
  paymentReference = "",
  paymentMethod = "upi",
  paymentStatus = "Paid",
  policyDocumentPath = "",
  requestedAgentId = null,
  recommendation = {},
  autoRenewalFlag = false,
}) {
  const agent = await resolveAgentForPurchase({
    requestedAgentId,
    fallbackAgentId: user.user_profile?.assigned_agent_id,
  });

  const commissionPercentage = Number(
    agent?.agent_details?.commission_percentage || 0,
  );
  const premiumAmount = Number(policy.price || 0);
  const commissionAmount = Number(
    ((premiumAmount * commissionPercentage) / 100).toFixed(2),
  );

  const aiScore = clampScore(recommendation.ai_score);
  const agentScore = clampScore(recommendation.agent_score);
  const finalRecommendationScore = clampScore(
    recommendation.final_recommendation_score ??
      (agent
        ? Number(((aiScore + agentScore) / 2).toFixed(2))
        : aiScore),
  );
  const recommendationSource =
    recommendation.recommendation_source ||
    (agent && agentScore > 0 ? "Hybrid" : "AI");

  const validFrom = recommendation.validFrom
    ? new Date(recommendation.validFrom)
    : new Date();
  const validTo = recommendation.validTo
    ? new Date(recommendation.validTo)
    : new Date(validFrom.getTime() + 365 * 24 * 60 * 60 * 1000);

  const purchaseRecord = {
    policy: policy._id,
    amount: premiumAmount,
    validFrom,
    validTo,
    paymentMethod,
    paymentReference,
    paymentStatus,
    policyDocumentPath,
    agent_id: agent?._id || null,
    commission_percentage: commissionPercentage,
    commission_amount: commissionAmount,
    commission_status: agent ? "Pending" : "Paid",
    renewal_agent_id: agent?._id || null,
    auto_renewal_flag: Boolean(autoRenewalFlag),
    renewal_status: "Pending",
    ai_score: aiScore,
    agent_score: agentScore,
    final_recommendation_score: finalRecommendationScore,
    recommendation_source: recommendationSource,
  };

  user.purchasedPolicies.push(purchaseRecord);
  await user.save();

  const payment = await Payment.create({
    user_id: user._id,
    policy_id: policy._id,
    agent_id: agent?._id || null,
    premium_amount: premiumAmount,
    payment_method: paymentMethod,
    payment_reference: paymentReference,
    payment_status: paymentStatus,
    commission_percentage: commissionPercentage,
    commission_amount: commissionAmount,
    commission_status: agent ? "Pending" : "Paid",
    renewal_agent_id: agent?._id || null,
    auto_renewal_flag: Boolean(autoRenewalFlag),
    renewal_status: "Pending",
    ai_score: aiScore,
    agent_score: agentScore,
    final_recommendation_score: finalRecommendationScore,
    recommendation_source: recommendationSource,
  });

  if (agent && commissionAmount > 0) {
    agent.agent_details.total_commission_earned = Number(
      ((agent.agent_details.total_commission_earned || 0) + commissionAmount).toFixed(2),
    );
    await agent.save({ validateBeforeSave: false });
  }

  return {
    payment,
    purchase: user.purchasedPolicies[user.purchasedPolicies.length - 1],
    agent,
  };
}
