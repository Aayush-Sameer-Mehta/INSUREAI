const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function ageFactor(age = 30) {
  if (age < 25) return 0.9;
  if (age < 35) return 1.0;
  if (age < 45) return 1.15;
  if (age < 60) return 1.35;
  return 1.6;
}

function riskFactor(riskScore = 0) {
  if (riskScore <= 33) return 0.9;
  if (riskScore <= 50) return 1.0;
  if (riskScore <= 66) return 1.15;
  if (riskScore <= 80) return 1.3;
  return 1.5;
}

function behaviorFactor({ smoking = false, claimHistory = 0, drivingHistory = "good" }) {
  let factor = 1;
  if (smoking) factor += 0.15;
  if (Number(claimHistory || 0) > 2) factor += 0.08;
  if (drivingHistory === "poor") factor += 0.08;
  return Number(factor.toFixed(2));
}

function termFactor(termYears = 1) {
  const years = Number(termYears || 1);
  if (years <= 5) return 0.95;
  if (years <= 10) return 1.0;
  if (years <= 20) return 1.12;
  if (years <= 30) return 1.22;
  return 1.3;
}

export function calculatePremiumBreakdown({
  basePremium,
  coverageAmount,
  policyCoverage,
  age,
  riskScore,
  smoking,
  claimHistory,
  drivingHistory,
  termYears,
}) {
  const base = Number(basePremium || 0);
  const requestedCoverage = Number(coverageAmount || policyCoverage || 0);
  const declaredCoverage = Number(policyCoverage || requestedCoverage || 1);

  const coverageMultiplier = clamp(requestedCoverage / Math.max(1, declaredCoverage), 0.6, 2.5);
  const computedAgeFactor = ageFactor(Number(age || 30));
  const computedRiskFactor = riskFactor(Number(riskScore || 0));
  const computedBehaviorFactor = behaviorFactor({ smoking, claimHistory, drivingHistory });
  const computedTermFactor = termFactor(termYears);

  const adjustedAnnual = Math.round(
    base *
      coverageMultiplier *
      computedAgeFactor *
      computedRiskFactor *
      computedBehaviorFactor *
      computedTermFactor
  );

  return {
    basePremium: base,
    adjustedAnnualPremium: adjustedAnnual,
    monthlyPremium: Math.round(adjustedAnnual / 12),
    quarterlyPremium: Math.round(adjustedAnnual / 4),
    factors: {
      coverageMultiplier: Number(coverageMultiplier.toFixed(2)),
      ageFactor: Number(computedAgeFactor.toFixed(2)),
      riskFactor: Number(computedRiskFactor.toFixed(2)),
      behaviorFactor: Number(computedBehaviorFactor.toFixed(2)),
      termFactor: Number(computedTermFactor.toFixed(2)),
    },
  };
}
