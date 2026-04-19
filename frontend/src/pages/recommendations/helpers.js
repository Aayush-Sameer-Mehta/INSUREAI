import { ALL_CATEGORIES } from "../../utils/categoryConfig";
import { toTitleCase } from "../../utils/formatters";

export function parseConditions(value) {
 return String(value || "")
 .split(",")
 .map((item) => item.trim())
 .filter(Boolean);
}

export function suggestedCategories(form) {
 const age = Number(form.age || 0);
 const income = Number(form.annualIncome || 0);
 const dependents = Number(form.numberOfDependents || 0);
 const conditions = parseConditions(form.healthConditions);
 const occupation = String(form.occupation || "").toLowerCase();
 const ranked = ALL_CATEGORIES.map((category) => {
 let score = 40;
 if (category === "health") score += 22;
 if (category === "life") score += 18;
 if (category === "personal_accident") score += 10;
 if (category === "health" && (conditions.length > 0 || form.smoking)) score += 16;
 if (category === "life" && (dependents > 0 || income >= 1000000)) score += 14;
 if (category === "group" && dependents >= 3) score += 8;
 if (category === "micro_social" && income > 0 && income < 500000) score += 14;
 if (category === "home" && income >= 1500000) score += 8;
 if (category === "travel" && age >= 21 && age <= 55) score += 6;
 if ((category === "car" || category === "bike") && age >= 18) score += 6;
 if (/driver|delivery|transport|logistics|fleet|truck|taxi|cab/.test(occupation) && category === "motor_commercial") score += 24;
 if (/doctor|lawyer|consultant|chartered accountant|ca|architect|engineer|agency|freelancer/.test(occupation) && category === "liability") score += 22;
 if (/business|owner|founder|entrepreneur|merchant|shop|retail|manufacturer|trader/.test(occupation) && (category === "business" || category === "group")) score += 20;
 if (/farmer|agriculture|agri|dairy|livestock/.test(occupation) && category === "agriculture") score += 28;
 return { category, score };
 })
 .sort((a, b) => b.score - a.score)
 .slice(0, 4)
 .map((item) => item.category);
 return ranked;
}

export function buildGoal(form) {
 const dependents = Number(form.numberOfDependents || 0);
 const conditions = parseConditions(form.healthConditions);
 if (dependents > 0 && conditions.length > 0) return "family health protection";
 if (dependents > 0) return "family income protection";
 if (conditions.length > 0 || form.smoking) return "health security";
 const occ = String(form.occupation || "").toLowerCase();
 if (/driver|delivery|transport|logistics|fleet|truck|taxi|cab/.test(occ)) return "commercial mobility protection";
 if (/doctor|lawyer|consultant|chartered accountant|ca|architect|engineer|agency|freelancer/.test(occ)) return "professional liability protection";
 if (/business|owner|founder|entrepreneur|merchant|shop|retail|manufacturer|trader/.test(occ)) return "business continuity protection";
 if (/farmer|agriculture|agri|dairy|livestock/.test(occ)) return "farm income protection";
 return "balanced protection";
}

export function fallbackReason(policy, form) {
 const dependents = Number(form.numberOfDependents || 0);
 const conditions = parseConditions(form.healthConditions);
 if (policy.category === "health" && (conditions.length > 0 || form.smoking)) {
 return "Why this fits you: your profile increases the value of stronger medical protection. What risks it covers: hospitalization, treatment, and recurring health costs. What happens if you skip it: one medical event can create a major financial setback.";
 }
 if (policy.category === "life" && dependents > 0) {
 return "Why this fits you: your dependents make income protection more important. What risks it covers: loss of family income and financial obligations. What happens if you skip it: your family may need to absorb a significant financial gap.";
 }
 if (policy.category === "personal_accident") {
 return "Why this fits you: accident-focused protection adds a practical backup for disability or injury-related income loss. What risks it covers: accidental death, disability, and recovery-linked costs. What happens if you skip it: a sudden accident could create both medical and income pressure at the same time.";
 }
 if (policy.category === "travel") {
 return "Why this fits you: travel cover protects against costly disruptions away from home. What risks it covers: emergency medical treatment, cancellations, baggage issues, and trip interruptions. What happens if you skip it: one travel emergency can become a fully out-of-pocket expense.";
 }
 if (policy.category === "home") {
 return "Why this fits you: property protection can reduce the financial hit from damage or theft. What risks it covers: structural loss, contents damage, and some disaster events. What happens if you skip it: repair or replacement costs stay entirely on you.";
 }
 return "Why this fits you: this policy balances protection and affordability for your profile. What risks it covers: category-specific claim costs and emergencies. What happens if you skip it: you retain more direct financial exposure.";
}

export function normalizeResult(data, form) {
 const riskScore = data?.riskProfile
 ? {
 totalScore: Number(data.riskProfile.score || data.riskScore || 0),
 riskLevel: String(data.riskLevel || data.riskProfile.category || "Medium Risk").replace(" Risk", ""),
 breakdown: Object.entries(data.riskProfile.factors || {}).map(([key, value]) => ({
 label: toTitleCase(key),
 score: Number(value || 0),
 maxScore: key === "health" ? 30 : 20,
 })),
 }
 : {
 totalScore: Number(data?.riskScore?.totalScore || data?.riskScore || 0),
 riskLevel: data?.riskLevel || data?.riskScore?.riskLevel || "Medium",
 breakdown: Object.values(data?.riskScore?.breakdown || {}),
 };

 const recommendations = (data?.recommendations || []).map((policy, index) => {
 const premiumBreakdown = policy.premiumBreakdown || policy.dynamicPremium || {};
 const yearlyPremium = Number(
 policy.premium || premiumBreakdown.adjustedAnnualPremium || premiumBreakdown.adjustedPremium || policy.price || 0
 );
 return {
 ...policy,
 id: policy.id || policy.policyId || policy._id,
 yearlyPremium,
 monthlyPremium: Number(policy.monthlyPremium || premiumBreakdown.monthlyPremium || premiumBreakdown.monthly || Math.round(yearlyPremium / 12)),
 matchScore: Math.round(Number(policy.matchScore || policy.recommendationScore || 72)),
 confidenceScore: Math.round(Number(policy.confidenceScore || policy.matchScore || 80)),
 recommendationTag: policy.recommendationTag || (index === 0 ? "Best for You" : "Smart Match"),
 pros: Array.isArray(policy.pros) && policy.pros.length ? policy.pros : (policy.benefits || []).slice(0, 3),
 cons: Array.isArray(policy.cons) ? policy.cons : [],
 aiReason: policy.aiReason || fallbackReason(policy, form),
 premiumBreakdown,
 };
 });

 return { riskScore, explanation: data?.explanation || "", recommendations };
}
