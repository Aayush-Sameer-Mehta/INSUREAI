const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function level(score) {
  if (score >= 70) return "High Risk";
  if (score >= 40) return "Medium Risk";
  return "Low Risk";
}

export function calculateFraudRiskScore({
  claimAmount = 0,
  policyCoverage = 0,
  claimFrequency = 0,
  hasDuplicateDocuments = false,
  suspiciousPatterns = [],
  locationMismatch = false,
  incidentWithin24h = false,
}) {
  let score = 0;
  const reasons = [];

  const amountRatio = Number(claimAmount || 0) / Math.max(1, Number(policyCoverage || 1));
  if (amountRatio > 0.8) {
    score += 25;
    reasons.push("Claim amount unusually close to total coverage");
  } else if (amountRatio > 0.5) {
    score += 14;
    reasons.push("High claim amount ratio");
  }

  if (claimFrequency >= 3) {
    score += 20;
    reasons.push("Frequent claim activity");
  } else if (claimFrequency === 2) {
    score += 10;
    reasons.push("Repeated claims in short period");
  }

  if (hasDuplicateDocuments) {
    score += 20;
    reasons.push("Duplicate document fingerprint detected");
  }

  if (Array.isArray(suspiciousPatterns) && suspiciousPatterns.length > 0) {
    score += clamp(suspiciousPatterns.length * 6, 0, 18);
    reasons.push(...suspiciousPatterns.map((p) => `Pattern flag: ${p}`));
  }

  if (locationMismatch) {
    score += 12;
    reasons.push("Location mismatch between reported and expected area");
  }

  if (incidentWithin24h) {
    score += 8;
    reasons.push("Claim filed very soon after policy purchase/change");
  }

  const fraudScore = clamp(Math.round(score), 0, 100);
  const fraudLevel = level(fraudScore);
  return { fraudScore, fraudLevel, reasons };
}

