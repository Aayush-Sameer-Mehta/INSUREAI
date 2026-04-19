import Policy from "../../policies/models/Policy.js";
import { calculatePremiumBreakdown } from "./premium.engine.js";

const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function normalizeCategory(category = "") {
  return String(category || "").toLowerCase();
}

function getPriorityWeights(profile = {}) {
  const age = Number(profile.age || 30);
  const income = Number(profile.income || profile.annualIncome || 0);
  const dependents = Number(profile.familySize || profile.numberOfDependents || 0);
  const healthConditions = Array.isArray(profile.healthConditions) ? profile.healthConditions : [];
  const smoking = Boolean(profile.smoking || profile.lifestyleHabits?.smoking);
  const riskAppetite = String(profile.riskProfile || profile.riskAppetite || "Medium");
  const occupation = String(profile.occupation || "").toLowerCase();

  const weights = {
    health: 0.82,
    life: 0.76,
    car: 0.52,
    bike: 0.46,
    travel: 0.44,
    home: 0.42,
    motor_commercial: 0.41,
    liability: 0.39,
    business: 0.43,
    agriculture: 0.35,
    micro_social: 0.34,
    specialty: 0.33,
    personal_accident: 0.58,
    group: 0.38,
  };

  if (age >= 40) {
    weights.health += 0.08;
    weights.life += 0.1;
  } else if (age <= 28) {
    weights.health += 0.03;
    weights.life -= 0.04;
  }

  if (income >= 1500000) {
    weights.life += 0.08;
    weights.home += 0.05;
    weights.business += 0.05;
    weights.liability += 0.04;
  } else if (income > 0 && income < 500000) {
    weights.health += 0.06;
    weights.life += 0.04;
    weights.micro_social += 0.12;
  }

  if (dependents >= 1) {
    weights.life += 0.12;
    weights.health += 0.04;
    weights.personal_accident += 0.06;
  }
  if (dependents >= 3) {
    weights.life += 0.08;
    weights.group += 0.05;
  }

  if (healthConditions.length > 0 || smoking) {
    weights.health += 0.14;
    weights.personal_accident += 0.08;
  }

  if (riskAppetite === "Low") {
    weights.health += 0.05;
    weights.life += 0.03;
    weights.personal_accident += 0.04;
    weights.micro_social += 0.04;
  }
  if (riskAppetite === "High") {
    weights.travel += 0.05;
    weights.car += 0.04;
    weights.bike += 0.04;
    weights.specialty += 0.05;
  }

  if (/driver|delivery|transport|logistics|fleet|truck|taxi|cab/.test(occupation)) {
    weights.motor_commercial += 0.18;
    weights.personal_accident += 0.08;
  }

  if (/doctor|lawyer|consultant|chartered accountant|ca|architect|engineer|agency|freelancer/.test(occupation)) {
    weights.liability += 0.16;
    weights.business += 0.06;
  }

  if (/business|owner|founder|entrepreneur|merchant|shop|retail|manufacturer|trader/.test(occupation)) {
    weights.business += 0.16;
    weights.liability += 0.08;
    weights.group += 0.06;
  }

  if (/farmer|agriculture|agri|dairy|livestock/.test(occupation)) {
    weights.agriculture += 0.24;
    weights.micro_social += 0.06;
  }

  return weights;
}

function policyGoalMatch(policy, goal = "") {
  const g = String(goal || "").toLowerCase();
  if (!g) return 0.6;
  const text = `${policy.name} ${policy.description} ${(policy.benefits || []).join(" ")}`.toLowerCase();
  if (text.includes(g)) return 1;
  if (g.includes("family") && policy.category === "health") return 0.9;
  if (g.includes("retirement") && policy.category === "life") return 0.9;
  if (g.includes("travel") && policy.category === "travel") return 0.95;
  return 0.5;
}

function affordabilityScore(policy, annualBudget = 0) {
  if (!annualBudget || annualBudget <= 0) return 0.7;
  if (policy.price <= annualBudget) return 1;
  const over = policy.price - annualBudget;
  return clamp(1 - over / Math.max(annualBudget, 1), 0, 1);
}

function riskFitScore(policy, riskCategory = "Moderate Risk") {
  const coverageWeight = policy.coverage / Math.max(policy.price, 1);
  if (riskCategory === "High Risk") return clamp(coverageWeight / 200, 0.4, 1);
  if (riskCategory === "Low Risk") return clamp(1 - policy.price / 100000, 0.4, 1);
  return clamp(coverageWeight / 260, 0.4, 1);
}

function categoryPriority(category) {
  const table = {
    health: 1.0,
    life: 0.95,
    car: 0.9,
    bike: 0.88,
    travel: 0.86,
    home: 0.84,
    personal_accident: 0.9,
    business: 0.84,
    motor_commercial: 0.82,
    liability: 0.8,
    group: 0.78,
    agriculture: 0.76,
    micro_social: 0.75,
    specialty: 0.74,
  };
  return table[category] || 0.8;
}

function policyCategoryFit(policy, profile) {
  const category = normalizeCategory(policy.category);
  const weights = getPriorityWeights(profile);
  return clamp(weights[category] || 0.45, 0.3, 1);
}

function coverageFitScore(policy, profile) {
  const desiredCoverage = Number(profile.coverageAmount || 0);
  if (!desiredCoverage) return clamp(Number(policy.coverage || 0) / 3000000, 0.45, 1);
  const ratio = Number(policy.coverage || 0) / Math.max(desiredCoverage, 1);
  return clamp(1 - Math.abs(1 - ratio), 0.35, 1);
}

function premiumPreferenceScore(policy, profile, premium) {
  const riskAppetite = String(profile.riskProfile || profile.riskAppetite || "Medium");
  const annualBudget = Number(profile.budget || 0);
  const adjustedAnnual = Number(premium.adjustedAnnualPremium || policy.price || 0);

  if (riskAppetite === "Low") {
    if (!annualBudget) return clamp(1 - adjustedAnnual / 120000, 0.45, 1);
    return clamp(annualBudget / Math.max(adjustedAnnual, 1), 0.4, 1);
  }

  if (riskAppetite === "High") {
    return clamp(Number(policy.coverage || 0) / Math.max(adjustedAnnual * 25, 1), 0.45, 1);
  }

  const valueRatio = Number(policy.coverage || 0) / Math.max(adjustedAnnual, 1);
  return clamp(valueRatio / 220, 0.45, 1);
}

function buildPros(policy, premium, profile) {
  const pros = [];
  const category = normalizeCategory(policy.category);
  const benefits = Array.isArray(policy.benefits) ? policy.benefits : [];
  const dependents = Number(profile.familySize || profile.numberOfDependents || 0);
  const healthConditions = Array.isArray(profile.healthConditions) ? profile.healthConditions : [];

  if (benefits.length) pros.push(...benefits.slice(0, 2));
  if (category === "life" && dependents > 0) {
    pros.push("Strong income protection for your dependents");
  }
  if (category === "health" && healthConditions.length > 0) {
    pros.push("Relevant for your declared medical risk factors");
  }
  if (category === "personal_accident") {
    pros.push("Adds a focused payout layer for accidental injury or disability");
  }
  if (category === "group") {
    pros.push("Useful when cover needs to extend across employees or members");
  }
  if (Number(policy.claimSettlementRatio || 0) >= 90) {
    pros.push(`High claim settlement ratio of ${policy.claimSettlementRatio}%`);
  }
  if (Number(premium.adjustedAnnualPremium || 0) <= Number(profile.budget || 0) && Number(profile.budget || 0) > 0) {
    pros.push("Fits within your stated annual budget");
  }

  return [...new Set(pros)].slice(0, 4);
}

function buildCons(policy, premium, profile) {
  const cons = [];
  const annualBudget = Number(profile.budget || 0);
  const adjustedAnnual = Number(premium.adjustedAnnualPremium || 0);

  if (annualBudget > 0 && adjustedAnnual > annualBudget) {
    cons.push("Premium is above your current annual budget");
  }
  if (Number(policy.waitingPeriodDays || 0) > 30) {
    cons.push(`Includes a waiting period of ${policy.waitingPeriodDays} days`);
  }
  if (Number(policy.claimSettlementRatio || 0) > 0 && Number(policy.claimSettlementRatio || 0) < 85) {
    cons.push(`Claim settlement ratio is moderate at ${policy.claimSettlementRatio}%`);
  }
  if (Number(policy.networkCount || 0) > 0 && Number(policy.networkCount || 0) < 2500 && normalizeCategory(policy.category) === "health") {
    cons.push("Smaller hospital network than top-tier plans");
  }

  return [...new Set(cons)].slice(0, 3);
}

function buildRiskSignals(profile = {}) {
  const signals = [];
  const smoking = Boolean(profile.smoking || profile.lifestyleHabits?.smoking);
  const healthConditions = Array.isArray(profile.healthConditions) ? profile.healthConditions : [];
  const dependents = Number(profile.familySize || profile.numberOfDependents || 0);
  const age = Number(profile.age || 30);

  if (smoking) signals.push("smoking-related health costs");
  if (healthConditions.length > 0) signals.push("pre-existing medical needs");
  if (dependents > 0) signals.push("income continuity for dependents");
  if (age >= 45) signals.push("higher age-linked claim probability");
  if (Number(profile.claimHistory || profile.claimStats?.totalClaims || 0) > 0) signals.push("repeat claim exposure");

  return signals;
}

function buildAiReason(policy, profile, riskProfile, premium, matchScore) {
  const category = normalizeCategory(policy.category);
  const dependents = Number(profile.familySize || profile.numberOfDependents || 0);
  const smoking = Boolean(profile.smoking || profile.lifestyleHabits?.smoking);
  const healthConditions = Array.isArray(profile.healthConditions) ? profile.healthConditions : [];
  const occupation = String(profile.occupation || "").toLowerCase();
  const riskSignals = buildRiskSignals(profile);

  const whyFitParts = [];
  if (category === "health") {
    if (smoking || healthConditions.length > 0) {
      whyFitParts.push("this health plan directly addresses your declared health and lifestyle risks");
    } else {
      whyFitParts.push("this health plan helps lock in broad protection while your profile is still manageable");
    }
  } else if (category === "life") {
    if (dependents > 0) {
      whyFitParts.push("this life policy helps protect the people who depend on your income");
    } else {
      whyFitParts.push("this life policy builds a financial safety net early");
    }
  } else if (category === "car" || category === "bike") {
    whyFitParts.push("this motor policy reduces the financial shock of repairs, theft, and liability claims");
  } else if (category === "travel") {
    whyFitParts.push("this travel plan protects trip costs and emergency medical exposure away from home");
  } else if (category === "home") {
    whyFitParts.push("this home policy helps protect your property and belongings from costly damage events");
  } else if (category === "motor_commercial") {
    whyFitParts.push("this commercial motor cover is more aligned with road-risk and business-use exposure");
  } else if (category === "liability") {
    whyFitParts.push("this liability cover can protect you from expensive legal and third-party claims");
  } else if (category === "business") {
    whyFitParts.push("this business policy helps shield operations, assets, and revenue from disruption");
  } else if (category === "agriculture") {
    whyFitParts.push("this agriculture policy helps reduce weather, crop, and farm-income volatility");
  } else if (category === "micro_social") {
    whyFitParts.push("this low-cost social protection plan improves baseline cover without stretching your budget");
  } else if (category === "specialty") {
    whyFitParts.push("this specialty plan targets a narrower but relevant real-world risk that standard cover may miss");
  } else if (category === "personal_accident") {
    whyFitParts.push("this accident cover adds a focused safety net for disability and injury-related income shocks");
  } else if (category === "group") {
    whyFitParts.push("this group cover becomes more useful when protection may need to extend beyond just one individual");
  } else {
    whyFitParts.push("this policy balances protection and premium well for your profile");
  }

  if (/driver|delivery|transport|logistics|fleet|truck|taxi|cab/.test(occupation) && category === "motor_commercial") {
    whyFitParts.push("your occupation increases the relevance of commercial vehicle protection");
  }
  if (/doctor|lawyer|consultant|chartered accountant|ca|architect|engineer/.test(occupation) && category === "liability") {
    whyFitParts.push("your profession can benefit from protection against negligence or liability claims");
  }
  if (/business|owner|founder|entrepreneur|merchant|shop|retail|manufacturer|trader/.test(occupation) && (category === "business" || category === "group")) {
    whyFitParts.push("your work profile increases the need to protect business continuity and team-related obligations");
  }
  if (/farmer|agriculture|agri|dairy|livestock/.test(occupation) && category === "agriculture") {
    whyFitParts.push("your occupation makes weather and farm-output protection more meaningful");
  }

  const coveredRiskText = riskSignals.length
    ? `It is especially relevant for ${riskSignals.slice(0, 2).join(" and ")}.`
    : "It covers common financial shocks that could otherwise become out-of-pocket expenses.";

  const noActionText =
    category === "life" && dependents > 0
      ? "Without it, your family may have limited financial cushioning if your income stops unexpectedly."
      : category === "health"
        ? "Without it, a medical event could quickly become a major financial setback."
        : category === "travel"
          ? "Without it, one disruption or medical emergency during a trip could become an expensive out-of-pocket event."
          : category === "home"
            ? "Without it, property damage or theft could turn into a large direct loss."
            : category === "business" || category === "liability"
              ? "Without it, legal disputes or operational setbacks could hit cash flow directly."
        : "Without it, you would carry more of the financial impact yourself when a claim event happens.";

  return `Why this fits you: ${whyFitParts.join(" ")}. `
    + `What risks it covers: ${coveredRiskText} `
    + `What happens if you skip it: ${noActionText} `
    + `Overall, it is a ${matchScore}% match for your ${riskProfile.category.toLowerCase()} profile.`;
}

function recommendationTag(index, policy, profile) {
  const category = normalizeCategory(policy.category);
  const dependents = Number(profile.familySize || profile.numberOfDependents || 0);
  const healthConditions = Array.isArray(profile.healthConditions) ? profile.healthConditions : [];

  if (index === 0) return "Best for You";
  if (category === "life" && dependents > 0) return "Family Priority";
  if (category === "health" && healthConditions.length > 0) return "Health Priority";
  if (Number(policy.price || 0) < 15000) return "Value Pick";
  return "Smart Match";
}

export async function getRankedRecommendations(profile, riskProfile) {
  const categories = Array.isArray(profile.categories) && profile.categories.length
    ? profile.categories.map((c) => String(c).toLowerCase())
    : ["health", "life", "car", "bike", "travel", "home", "motor_commercial", "liability", "business", "agriculture", "micro_social", "specialty", "personal_accident", "group"];

  const filter = { category: { $in: categories } };
  if (profile.budget && Number(profile.budget) > 0) {
    filter.price = { $lte: Number(profile.budget) * 1.4 };
  }

  const policies = await Policy.find(filter).lean();
  const annualBudget = Number(profile.budget || 0);

  const ranked = policies
    .map((policy) => {
      const premium = calculatePremiumBreakdown({
        basePremium: policy.price,
        coverageAmount: profile.coverageAmount || policy.coverage,
        policyCoverage: policy.coverage,
        age: profile.age,
        riskScore: riskProfile.score,
        smoking: profile.smoking || profile.lifestyleHabits?.smoking,
        claimHistory: profile.claimHistory || profile.claimStats?.totalClaims || 0,
        drivingHistory: profile.drivingHistory || "good",
      });

      const scores = {
        policyScore: clamp(Number(policy.score || 50) / 100, 0, 1),
        affordability: affordabilityScore(policy, annualBudget),
        riskFit: riskFitScore(policy, riskProfile.category),
        goalFit: policyGoalMatch(policy, profile.insuranceGoal),
        categoryPriority: categoryPriority(policy.category),
        categoryFit: policyCategoryFit(policy, profile),
        coverageFit: coverageFitScore(policy, profile),
        premiumFit: premiumPreferenceScore(policy, profile, premium),
      };
      const finalScore =
        scores.policyScore * 0.18 +
        scores.affordability * 0.14 +
        scores.riskFit * 0.15 +
        scores.goalFit * 0.12 +
        scores.categoryPriority * 0.08 +
        scores.categoryFit * 0.15 +
        scores.coverageFit * 0.1 +
        scores.premiumFit * 0.08;

      const matchScore = Math.round(clamp(finalScore, 0, 1) * 100);
      const confidenceScore = Math.round(
        clamp(
          finalScore * 0.72 +
          scores.policyScore * 0.12 +
          scores.riskFit * 0.08 +
          scores.categoryFit * 0.08,
          0,
          1
        ) * 100
      );

      return {
        ...policy,
        id: policy.policyId || policy._id,
        recommendationScore: Number((finalScore * 100).toFixed(2)),
        matchScore,
        confidenceScore,
        monthlyPremium: premium.monthlyPremium,
        premiumBreakdown: premium,
        premium: premium.adjustedAnnualPremium,
        pros: buildPros(policy, premium, profile),
        cons: buildCons(policy, premium, profile),
        aiReason: buildAiReason(policy, profile, riskProfile, premium, matchScore),
        explainability: scores,
      };
    })
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 8);

  return ranked.map((policy, index) => ({
    ...policy,
    recommendationTag: recommendationTag(index, policy, profile),
  }));
}

import { GoogleGenAI } from "@google/genai";

export async function buildRecommendationExplanation(profile, riskProfile, topPolicies) {
  const top = topPolicies[0];
  const goal = profile.insuranceGoal ? `for your goal "${profile.insuranceGoal}"` : "for your profile";
  if (!top) {
    return `No direct policy match found ${goal}. Try broadening category or budget filters.`;
  }

  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const prompt = `You are an expert Insurance Advisor AI.
User Profile:
- Age: ${profile.age || 30}
- Occupation: ${profile.occupation || 'Standard'}
- Health/Smoking: ${profile.healthConditions?.length ? 'Pre-existing conditions' : 'Healthy'}, ${profile.smoking ? 'Smoker' : 'Non-smoker'}
- Dependents: ${profile.familySize || profile.numberOfDependents || 0}
- Risk Score: ${riskProfile.score}/100 (${riskProfile.category})

Top Recommended Policy:
- Name: ${top.name} (${top.category} insurance)
- Match Score: ${top.matchScore}%
- AI Reason Tag: ${top.aiReason}

Write a highly personalized, empathetic 2-3 sentence explanation directly to the user addressing why this specific policy is their #1 recommendation. Mention their specific life factors (like dependents, age, or health). Do not use markdown formatting.`;

      const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: prompt,
          config: { temperature: 0.4 }
      });

      if (response.text) return response.text.trim();
    } catch (error) {
       console.error("Gemini V2 Explanation failed:", error.message);
    }
  }

  // Fallback
  return `Based on your ${riskProfile.category.toLowerCase()} profile (score ${riskProfile.score}/100), ${top.name} ranks highest with a ${top.matchScore}% profile match and ${top.confidenceScore}% confidence. This recommendation balances premium, coverage, and your risk protection perfectly.`;
}
