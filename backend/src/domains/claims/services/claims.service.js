import Claim from "../models/Claim.js";
import FraudReview from "../models/FraudReview.js";
import { calculateFraudRiskScore } from "./fraud.engine.js";

export function buildTimelineEntry({ status, note = "", actor = null }) {
  return {
    status,
    note,
    actor,
    at: new Date(),
  };
}

export async function createClaimWithFraudAssessment({
  userId,
  policy,
  payload,
  claimFrequency,
}) {
  const suspiciousPatterns = [];
  if (Number(payload.claimAmount || 0) > Number(policy.coverage || 0) * 0.9) {
    suspiciousPatterns.push("High amount near coverage limit");
  }
  if (String(payload.reason || "").length < 15) {
    suspiciousPatterns.push("Very short claim reason");
  }

  const fraud = calculateFraudRiskScore({
    claimAmount: payload.claimAmount,
    policyCoverage: policy.coverage,
    claimFrequency,
    hasDuplicateDocuments: false,
    suspiciousPatterns,
    locationMismatch: Boolean(payload.locationMismatch),
    incidentWithin24h: Boolean(payload.incidentWithin24h),
  });

  const claim = await Claim.create({
    user: userId,
    policy: policy._id,
    agent_id: payload.agent_id || null,
    handled_by_agent: Boolean(payload.handled_by_agent),
    agent_assisted: Boolean(payload.agent_assisted),
    approval_status: payload.approval_status || "Pending",
    claimAmount: payload.claimAmount,
    reason: payload.reason,
    incidentDate: payload.incidentDate,
    documents: Array.isArray(payload.documents) ? payload.documents : [],
    fraudRiskScore: fraud.fraudScore,
    fraudRiskLevel: fraud.fraudLevel,
    fraudSignals: fraud.reasons,
    requiresFraudReview: fraud.fraudLevel === "High Risk",
    geoLocation: payload.geoLocation || {},
    hospitalDetails: payload.hospitalDetails || {},
    financialSettlement: {
      requestedAmount: payload.claimAmount,
      payoutBankDetails: payload.payoutBankDetails || {},
    },
    workflowTimeline: [
      buildTimelineEntry({ status: "Submitted", note: "Claim submitted", actor: userId }),
    ],
  });

  if (fraud.fraudLevel === "High Risk") {
    await FraudReview.create({
      claim: claim._id,
      fraudScore: fraud.fraudScore,
      fraudLevel: fraud.fraudLevel,
      reasons: fraud.reasons,
      status: "Pending",
    });
  }

  return { claim, fraud };
}
