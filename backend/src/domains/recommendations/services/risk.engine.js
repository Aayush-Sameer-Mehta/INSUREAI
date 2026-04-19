const OCCUPATION_RISK_WEIGHTS = {
  doctor: 8,
  nurse: 10,
  police: 14,
  firefighter: 18,
  pilot: 16,
  driver: 14,
  construction: 16,
  factory: 12,
  teacher: 6,
  engineer: 7,
  student: 8,
  business: 9,
  default: 8,
};

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function ageScore(age = 30) {
  if (age <= 25) return 8;
  if (age <= 35) return 12;
  if (age <= 45) return 16;
  if (age <= 55) return 20;
  return 25;
}

function healthScore({ smoking, drinking, healthConditions = [] }) {
  let score = 0;
  if (smoking) score += 12;
  if (drinking) score += 6;
  score += clamp(healthConditions.length * 3, 0, 12);
  return clamp(score, 0, 30);
}

function claimHistoryScore(claimStats = {}, explicitClaimHistory = 0) {
  const claims = Number(claimStats.totalClaims || explicitClaimHistory || 0);
  const rejected = Number(claimStats.rejectedClaims || 0);
  return clamp(claims * 5 + rejected * 2, 0, 20);
}

function drivingScore(drivingProfile = {}, drivingHistory = "good") {
  let score = 0;
  score += clamp(Number(drivingProfile.accidentsLast3Years || 0) * 4, 0, 12);
  score += clamp(Number(drivingProfile.trafficViolationsLast3Years || 0) * 2, 0, 8);
  if (drivingHistory === "poor") score += 6;
  if (drivingHistory === "average") score += 3;
  return clamp(score, 0, 20);
}

function occupationScore(occupation = "", occupationRiskClass = "") {
  if (occupationRiskClass === "High") return 15;
  if (occupationRiskClass === "Moderate") return 10;
  if (occupationRiskClass === "Low") return 6;
  const normalized = String(occupation || "").toLowerCase().trim();
  return OCCUPATION_RISK_WEIGHTS[normalized] || OCCUPATION_RISK_WEIGHTS.default;
}

export function calculateCustomerRiskScore(input = {}) {
  const profile = input || {};
  const breakdown = {
    age: ageScore(Number(profile.age || 30)),
    health: healthScore({
      smoking: Boolean(profile.lifestyleHabits?.smoking || profile.smoking),
      drinking: Boolean(profile.lifestyleHabits?.drinking || profile.drinking),
      healthConditions: profile.healthConditions || [],
    }),
    claimHistory: claimHistoryScore(profile.claimStats, profile.claimHistory),
    occupation: occupationScore(profile.occupation, profile.occupationRiskClass),
    driving: drivingScore(profile.drivingProfile, profile.drivingHistory),
  };

  const rawTotal = breakdown.age + breakdown.health + breakdown.claimHistory + breakdown.occupation + breakdown.driving;
  const score = clamp(rawTotal, 0, 100);
  const category = score <= 33 ? "Low Risk" : score <= 66 ? "Moderate Risk" : "High Risk";

  return { score, category, factors: breakdown };
}

