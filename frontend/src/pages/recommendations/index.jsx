import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
 Activity,
 AlertTriangle,
 ArrowRight,
 BarChart3,
 Brain,
 CheckCircle2,
 ChevronDown,
 ChevronUp,
 Cigarette,
 Gauge,
 IndianRupee,
 Info,
 RefreshCw,
 Shield,
 Sparkles,
 Star,
 User,
 Users,
 Wine,
} from "lucide-react";
import toast from "react-hot-toast";
import SectionHeader from "../../components/layout/SectionHeader";
import { useAuth } from "../../hooks/useAuth";
import { getPersonalizedRecommendations } from "../../services/aiService";
import { formatCurrency, toTitleCase } from "../../utils/formatters";
import { ALL_CATEGORIES, CATEGORY_GRADIENTS, CATEGORY_ICONS } from "../../utils/categoryConfig";

import RiskGauge, { BreakdownBar, RISK_STYLES } from "./RiskGauge";
import ComparisonTable from "./ComparisonTable";
import { parseConditions, suggestedCategories, buildGoal, normalizeResult } from "./helpers";

const ANALYSIS_STEPS = [
 "Analyzing your profile...",
 "Calculating risk score...",
 "Finding best policies...",
 "Generating AI explanations...",
];

export function ScorePill({ children, tone = "slate" }) {
 const styles = {
 slate: "border-slate-200 bg-slate-50 text-slate-700 ",
 emerald: "border-emerald-200 bg-emerald-50 text-emerald-700 ",
 amber: "border-amber-200 bg-amber-50 text-amber-700 ",
 };
 return <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${styles[tone]}`}>{children}</span>;
}

export default function Recommendations() {
 const { user } = useAuth();
 const [form, setForm] = useState({
 age: "",
 annualIncome: "",
 numberOfDependents: "0",
 smoking: false,
 drinking: false,
 riskAppetite: "Medium",
 healthConditions: "",
 occupation: "",
 categories: [],
 budget: "",
 });
 const [coverageMode, setCoverageMode] = useState("auto");
 const [loading, setLoading] = useState(false);
 const [analysisIndex, setAnalysisIndex] = useState(0);
 const [result, setResult] = useState(null);
 const [showBreakdown, setShowBreakdown] = useState(false);
 const [compareIds, setCompareIds] = useState([]);
 const focusCategories = suggestedCategories(form);

 useEffect(() => {
 if (!user) return;
 setForm((prev) => ({
 ...prev,
 age: user.age ? String(user.age) : prev.age,
 annualIncome: user.annualIncome ? String(user.annualIncome) : prev.annualIncome,
 numberOfDependents: user.numberOfDependents != null ? String(user.numberOfDependents) : prev.numberOfDependents,
 occupation: user.occupation || prev.occupation,
 smoking: Boolean(user.lifestyleHabits?.smoking),
 drinking: Boolean(user.lifestyleHabits?.drinking),
 riskAppetite: user.riskAppetite || prev.riskAppetite,
 healthConditions: Array.isArray(user.existingDiseases) ? user.existingDiseases.join(", ") : prev.healthConditions,
 categories: prev.categories,
 }));
 }, [user]);

 useEffect(() => {
 if (!loading) {
 setAnalysisIndex(0);
 return undefined;
 }
 const timer = window.setInterval(() => {
 setAnalysisIndex((prev) => (prev + 1) % ANALYSIS_STEPS.length);
 }, 1200);
 return () => window.clearInterval(timer);
 }, [loading]);

 const setField = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));
 const useAiCoverageFocus = () => {
 setCoverageMode("auto");
 setForm((prev) => ({ ...prev, categories: [] }));
 };
 const applySmartDefaults = () => {
 setCoverageMode("auto");
 setForm((prev) => ({
 ...prev,
 categories: [],
 budget: prev.budget,
 }));
 };
 const toggleCategory = (category) => {
 setCoverageMode("manual");
 setForm((prev) => ({
 ...prev,
 categories: prev.categories.includes(category)
 ? prev.categories.filter((item) => item !== category)
 : [...prev.categories, category],
 }));
 };
 const toggleCompare = (id) => {
 setCompareIds((prev) => {
 if (prev.includes(id)) return prev.filter((item) => item !== id);
 if (prev.length >= 3) return [...prev.slice(1), id];
 return [...prev, id];
 });
 };

 const onSubmit = async (event) => {
 event.preventDefault();
 if (!form.age || Number(form.age) < 1) {
 toast.error("Please enter a valid age");
 return;
 }

 setLoading(true);
 setCompareIds([]);

 try {
 const payload = {
 age: Number(form.age),
 income: Number(form.annualIncome) || Number(user?.annualIncome) || 500000,
 familySize: Number(form.numberOfDependents) || 0,
 occupation: form.occupation || user?.occupation || "",
 riskProfile: form.riskAppetite,
 healthConditions: parseConditions(form.healthConditions),
 smoking: form.smoking,
 drivingHistory: "good",
 claimHistory: user?.claimStats?.totalClaims || 0,
 categories: coverageMode === "manual" ? form.categories : [],
 budget: form.budget ? Number(form.budget) : undefined,
 insuranceGoal: buildGoal(form),
 };

 const response = await getPersonalizedRecommendations(payload);
 const nextResult = normalizeResult(response, form);
 setResult(nextResult);
 setCompareIds(nextResult.recommendations.slice(0, 2).map((policy) => policy.id));
 toast.success(`Found ${nextResult.recommendations.length} advisor matches`);
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to get recommendations");
 } finally {
 setLoading(false);
 }
 };

 const summaryFlags = [];
 if (form.smoking) summaryFlags.push("Smoker");
 if (parseConditions(form.healthConditions).length > 0) summaryFlags.push("Health Risk");
 if (Number(form.numberOfDependents || 0) >= 3) summaryFlags.push("High Dependents");

 return (
 <div className="space-y-8 page-shell">
 <div className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-gradient-to-br from-white via-primary-50 to-cyan-50 p-6 shadow-sm sm:p-8">
 <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-cyan-200/30 blur-3xl " />
 <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-primary-300/20 blur-3xl " />
 <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
 <div className="max-w-2xl">
 <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur ">
 <Brain className="h-3.5 w-3.5 text-primary-500" />
 AI Insurance Advisor
 </div>
 <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
 Personalized insurance advice with real AI reasoning
 </h1>
 <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 ">
 Get recommendations, confidence scores, and explainable policy guidance tailored to your profile.
 </p>
 </div>
 <div className="grid gap-3 sm:grid-cols-3">
 <ScorePill>Age: {form.age || "Auto-fill ready"}</ScorePill>
 <ScorePill>Income: {form.annualIncome ? formatCurrency(Number(form.annualIncome)) : "Add income"}</ScorePill>
 <ScorePill>Dependents: {form.numberOfDependents || "0"}</ScorePill>
 </div>
 </div>
 </div>

 <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
 <motion.form onSubmit={onSubmit} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
 <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm ">
 <SectionHeader
 icon={Sparkles}
 title="Advisor Input"
 subtitle="Tell the AI how to balance coverage, family protection, and affordability."
 action={
 <button type="button" onClick={applySmartDefaults} className="rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 ">
 Apply Smart Defaults
 </button>
 }
 />

 <div className="mt-5 grid gap-4 sm:grid-cols-2">
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><User className="h-4 w-4 text-primary-500" />Age</label>
 <input type="number" min="1" max="120" className="field" value={form.age} onChange={(e) => setField("age", e.target.value)} placeholder="30" />
 </div>
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><IndianRupee className="h-4 w-4 text-primary-500" />Annual Income</label>
 <input type="number" className="field" value={form.annualIncome} onChange={(e) => setField("annualIncome", e.target.value)} placeholder="800000" />
 </div>
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><BarChart3 className="h-4 w-4 text-primary-500" />Occupation</label>
 <input type="text" className="field" value={form.occupation} onChange={(e) => setField("occupation", e.target.value)} placeholder="Engineer, Business Owner, Driver" />
 </div>
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><Users className="h-4 w-4 text-primary-500" />Dependents</label>
 <input type="number" min="0" max="10" className="field" value={form.numberOfDependents} onChange={(e) => setField("numberOfDependents", e.target.value)} placeholder="0" />
 </div>
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><IndianRupee className="h-4 w-4 text-primary-500" />Budget Cap</label>
 <input type="number" className="field" value={form.budget} onChange={(e) => setField("budget", e.target.value)} placeholder="Optional yearly budget" />
 </div>
 </div>

 <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><Activity className="h-4 w-4 text-primary-500" />Health Conditions</label>
 <input type="text" className="field" value={form.healthConditions} onChange={(e) => setField("healthConditions", e.target.value)} placeholder="Diabetes, Hypertension" />
 </div> 
 <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 ">
 <div className="grid gap-4 md:grid-cols-2">
 {[["smoking", Cigarette, "Smoking"], ["drinking", Wine, "Drinking"]].map(([key, Icon, label]) => (
 <div key={key}>
 <p className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 "><Icon className="h-4 w-4 text-primary-500" />{label}</p>
 <div className="grid grid-cols-2 gap-2">
 {[false, true].map((value) => (
 <button
 key={`${key}-${String(value)}`}
 type="button"
 onClick={() => setField(key, value)}
 className={`rounded-2xl border px-2 py-2 text-sm font-semibold ${
 form[key] === value
 ? "border-primary-500 bg-primary-50 text-primary-700 "
 : "border-slate-200 bg-white text-slate-600 "
 }`}
 >
 {value ? "Yes" : "No"}
 </button>
 ))}
 </div>
 </div>
 ))}
 </div>
 </div>
 </div>
 </div>

 <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm ">
 <SectionHeader icon={Shield} title="Coverage Focus" subtitle="Let the advisor choose the best policy types for you, or manually narrow the search." />

 <div className="mt-5 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
 <button
 type="button"
 onClick={useAiCoverageFocus}
 className={`relative overflow-hidden rounded-[26px] border p-5 text-left transition ${
 coverageMode === "auto"
 ? "border-primary-500 bg-gradient-to-br from-primary-50 via-white to-cyan-50 shadow-md "
 : "border-slate-200 bg-slate-50/80 hover:border-slate-300 "
 }`}
 >
 <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-cyan-200/30 blur-3xl " />
 <div className="relative">
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.24em] text-primary-500">Recommended</p>
 <h3 className="mt-2 text-lg font-bold text-slate-900 ">AI Auto Select</h3>
 <p className="mt-2 text-sm leading-6 text-slate-600 ">
 The advisor evaluates all policy categories in the system, then ranks the best matches from your age, income, dependents, occupation, and risk signals.
 </p>
 </div>
 <ScorePill tone={coverageMode === "auto" ? "emerald" : "slate"}>
 {coverageMode === "auto" ? "Active" : "Available"}
 </ScorePill>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {focusCategories.map((category) => {
 const Icon = CATEGORY_ICONS[category];
 return (
 <span key={category} className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm ">
 <span className={`flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br ${CATEGORY_GRADIENTS[category]} text-white`}>
 <Icon className="h-3 w-3" />
 </span>
 {toTitleCase(category)}
 </span>
 );
 })}
 </div>
 </div>
 </button>

 <div className={`rounded-[26px] border p-5 transition ${
 coverageMode === "manual"
 ? "border-amber-300 bg-amber-50/70 "
 : "border-slate-200 bg-slate-50/80 "
 }`}>
 <div className="flex items-start justify-between gap-4">
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-600 ">Optional</p>
 <h3 className="mt-2 text-lg font-bold text-slate-900 ">Manual Focus</h3>
 <p className="mt-2 text-sm leading-6 text-slate-600 ">
 Use this only when you want to intentionally restrict recommendations to specific policy categories.
 </p>
 </div>
 <button
 type="button"
 onClick={() => setCoverageMode("manual")}
 className={`rounded-full border px-3 py-2 text-xs font-semibold ${
 coverageMode === "manual"
 ? "border-amber-500 bg-white text-amber-700 "
 : "border-slate-200 bg-white text-slate-600 "
 }`}
 >
 {coverageMode === "manual" ? "Editing" : "Customize"}
 </button>
 </div>

 <div className="mt-4 flex flex-wrap gap-2">
 {form.categories.length > 0 ? (
 form.categories.map((category) => (
 <ScorePill key={category} tone="amber">{toTitleCase(category)}</ScorePill>
 ))
 ) : (
 <p className="text-sm text-slate-500 ">No manual filters selected. AI auto-select will stay in control until you choose categories.</p>
 )}
 </div>
 </div>
 </div>

 <AnimatePresence initial={false}>
 {coverageMode === "manual" && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
 {ALL_CATEGORIES.map((category) => {
 const Icon = CATEGORY_ICONS[category];
 const active = form.categories.includes(category);
 return (
 <button
 key={category}
 type="button"
 onClick={() => toggleCategory(category)}
 className={`group rounded-2xl border p-3 text-left transition ${
 active
 ? "border-amber-500 bg-white shadow-sm "
 : "border-slate-200 bg-slate-50 hover:border-slate-300 "
 }`}
 >
 <div className="flex items-center gap-3">
 <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${CATEGORY_GRADIENTS[category]} text-white`}>
 <Icon className="h-4 w-4" />
 </div>
 <div className="min-w-0">
 <p className={`text-sm font-semibold ${active ? "text-slate-900 " : "text-slate-700 "}`}>{toTitleCase(category)}</p>
 <p className="text-xs text-slate-500 ">{active ? "Included in filter" : "Tap to include"}</p>
 </div>
 </div>
 </button>
 );
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 ">
 {coverageMode === "auto"
 ? `AI focus categories right now: ${focusCategories.map(toTitleCase).join(" + ")}. Recommendations are still ranked from the full policy catalog based on the user profile.`
 : form.categories.length > 0
 ? `Manual focus is active for ${form.categories.map(toTitleCase).join(", ")}. Only those policy types will be considered.`
 : "Manual focus is open, but no categories are selected yet. Switch back to AI Auto Select for unrestricted recommendations."}
 </div>
 </div>

 <button type="submit" disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary-600 to-cyan-600 px-6 py-4 text-sm font-bold text-white shadow-lg shadow-primary-500/20 disabled:opacity-70">
 {loading ? <><RefreshCw className="h-4 w-4 animate-spin" />{ANALYSIS_STEPS[analysisIndex]}</> : <><Brain className="h-4 w-4" />Generate AI Advisor Recommendations<Sparkles className="h-4 w-4" /></>}
 </button>
 </motion.form>

 <div className="space-y-5">
 <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm ">
 <SectionHeader icon={Gauge} title="Advisor Snapshot" subtitle="Your profile summary and live risk interpretation." />

 {loading ? (
 <div className="mt-5 space-y-4">
 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 ">
 <p className="text-sm font-semibold text-slate-700 ">{ANALYSIS_STEPS[analysisIndex]}</p>
 <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 ">
 <motion.div className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-500" initial={{ width: "8%" }} animate={{ width: `${((analysisIndex + 1) / ANALYSIS_STEPS.length) * 100}%` }} transition={{ duration: 0.4 }} />
 </div>
 </div>
 </div>
 ) : result ? (
 <div className="mt-5 space-y-5">
 <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-center">
 <div className="grid gap-3 sm:grid-cols-2">
 <ScorePill>Age: {form.age || "N/A"}</ScorePill>
 <ScorePill>Income: {form.annualIncome ? formatCurrency(Number(form.annualIncome)) : "Not shared"}</ScorePill>
 <ScorePill>Dependents: {form.numberOfDependents || "0"}</ScorePill>
 <ScorePill tone={result.riskScore.riskLevel === "High" ? "amber" : "emerald"}>Risk Level: {result.riskScore.riskLevel}</ScorePill>
 </div>
 <RiskGauge score={result.riskScore.totalScore} riskLevel={result.riskScore.riskLevel} />
 </div>

 <div className="flex flex-wrap gap-2">
 {summaryFlags.length ? summaryFlags.map((flag) => <ScorePill key={flag} tone="amber">{flag}</ScorePill>) : <ScorePill tone="emerald">No major profile flags</ScorePill>}
 </div>

 {result.riskScore.riskLevel === "High" && (
 <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${RISK_STYLES.High}`}>
 You are in a high-risk category. The advisor is prioritizing stronger protection over lowest premium.
 </div>
 )}

 <div className="rounded-[24px] border border-slate-200 bg-slate-50/80 p-4 ">
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-cyan-500 text-white">
 <Sparkles className="h-4 w-4" />
 </div>
 <div>
 <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">AI Insight</p>
 <p className="mt-2 text-sm leading-6 text-slate-700 ">{result.explanation}</p>
 </div>
 </div>
 </div>

 <button type="button" onClick={() => setShowBreakdown((prev) => !prev)} className="flex items-center gap-2 text-sm font-semibold text-primary-600 ">
 {showBreakdown ? "Hide" : "Show"} risk breakdown
 {showBreakdown ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
 </button>

 <AnimatePresence>
 {showBreakdown && (
 <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="space-y-3 overflow-hidden">
 {result.riskScore.breakdown.map((item, index) => <BreakdownBar key={`${item.label}-${index}`} item={item} />)}
 </motion.div>
 )}
 </AnimatePresence>
 </div>
 ) : (
 <div className="mt-5 rounded-[24px] border-2 border-dashed border-slate-200 bg-slate-50/70 p-8 text-center ">
 <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-100 ">
 <Brain className="h-7 w-7 text-primary-500" />
 </div>
 <h3 className="mt-4 text-lg font-bold text-slate-900 ">Your advisor summary will appear here</h3>
 <p className="mt-2 text-sm text-slate-500 ">Fill in your profile to generate explainable insurance guidance.</p>
 </div>
 )}
 </div>

 <div className="rounded-[28px] border border-slate-200 bg-white/90 p-6 shadow-sm ">
 <SectionHeader icon={Info} title="How The Advisor Thinks" subtitle="Explainability is built into each recommendation." />
 <div className="mt-5 grid gap-3 text-sm text-slate-600 ">
 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ">Age, dependents, and declared health details raise the priority of protection-heavy categories like life, health, and personal accident.</div>
 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ">Income and budget shape affordability so recommendations stay practical.</div>
 <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 ">Occupation and lifestyle help the advisor rank broader categories such as commercial motor, liability, business, agriculture, travel, and home cover.</div>
 </div>
 </div>
 </div>
 </div>

 {result && result.recommendations.length > 0 && (
 <section className="space-y-6">
 <SectionHeader icon={Star} title="Recommended Policies" subtitle={`${result.recommendations.length} plans ranked for your profile with explainable AI reasoning.`} />
 <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-2xl sm:rounded-[28px] border border-slate-200 bg-white/95 shadow-sm ">
 {/* ─── Mobile Card View ─────────────────────── */}
 <div className="divide-y divide-slate-100 lg:hidden">
 {result.recommendations.map((policy, index) => (
 <div key={policy.id || index} className="p-4 sm:p-5 space-y-3">
 <div className="flex items-start justify-between gap-3">
 <div className="min-w-0 flex-1">
 <div className={`inline-flex rounded-full bg-gradient-to-r ${CATEGORY_GRADIENTS[policy.category] || "from-slate-700 to-slate-900"} px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white`}>
 {toTitleCase(policy.category)}
 </div>
 <p className="mt-1.5 text-sm font-bold text-slate-900 ">{policy.name}</p>
 <p className="text-xs text-slate-500 ">{policy.company}</p>
 </div>
 <div className="flex flex-col items-end gap-1.5 shrink-0">
 <ScorePill tone="emerald">Match: {policy.matchScore}%</ScorePill>
 <ScorePill tone="amber">Confidence: {policy.confidenceScore}%</ScorePill>
 </div>
 </div>
 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-xl bg-slate-50 p-3 ">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Coverage</p>
 <p className="mt-0.5 text-sm font-bold text-slate-900 ">{formatCurrency(policy.coverage || 0)}</p>
 </div>
 <div className="rounded-xl bg-slate-50 p-3 ">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Premium</p>
 <p className="mt-0.5 text-sm font-bold text-slate-900 ">{formatCurrency(policy.yearlyPremium || 0)}/yr</p>
 </div>
 </div>
 {policy.aiReason && (
 <p className="text-xs leading-relaxed text-slate-600 line-clamp-3">{policy.aiReason}</p>
 )}
 {(policy.pros?.length > 0 || policy.cons?.length > 0) && (
 <div className="flex flex-wrap gap-2">
 {(policy.pros || []).slice(0, 2).map((item, ii) => (
 <span key={`pro-${ii}`} className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 ">
 <CheckCircle2 className="h-3 w-3" />{item}
 </span>
 ))}
 {(policy.cons || []).slice(0, 1).map((item, ii) => (
 <span key={`con-${ii}`} className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ">
 <AlertTriangle className="h-3 w-3" />{item}
 </span>
 ))}
 </div>
 )}
 <div className="flex gap-2">
 <button
 type="button"
 onClick={() => toggleCompare(policy.id)}
 className={`flex-1 rounded-xl border px-3 py-2.5 text-xs font-bold transition ${
 compareIds.includes(policy.id)
 ? "border-primary-500 bg-primary-50 text-primary-700 "
 : "border-slate-200 bg-slate-50 text-slate-600 "
 }`}
 >
 {compareIds.includes(policy.id) ? "Selected" : "Compare"}
 </button>
 <Link to={`/policies/${policy.id}`} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-cyan-600 px-3 py-2.5 text-xs font-bold text-white">
 Details
 <ArrowRight className="h-3.5 w-3.5" />
 </Link>
 </div>
 </div>
 ))}
 </div>

 {/* ─── Desktop Table View ───────────────────── */}
 <div className="hidden overflow-x-auto lg:block">
 <table className="min-w-full text-left">
 <thead className="bg-slate-50/80 ">
 <tr className="border-b border-slate-200 ">
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Policy</th>
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Coverage</th>
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Premium</th>
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Scores</th>
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">AI Summary</th>
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Pros / Cons</th>
 <th className="px-4 py-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Actions</th>
 </tr>
 </thead>
 <tbody>
 {result.recommendations.map((policy, index) => (
 <tr key={policy.id || index} className="border-b border-slate-100 align-top last:border-b-0 ">
 <td className="px-4 py-4">
 <div className="min-w-[200px]">
 <div className={`inline-flex rounded-full bg-gradient-to-r ${CATEGORY_GRADIENTS[policy.category] || "from-slate-700 to-slate-900"} px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-white`}>
 {toTitleCase(policy.category)}
 </div>
 <p className="mt-2 text-sm font-bold text-slate-900 ">{policy.name}</p>
 <p className="text-xs text-slate-500 ">{policy.company}</p>
 <div className="mt-2">
 <ScorePill>{policy.recommendationTag}</ScorePill>
 </div>
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="min-w-[120px]">
 <p className="text-sm font-bold text-slate-900 ">{formatCurrency(policy.coverage || 0)}</p>
 <p className="mt-1 text-xs text-slate-500 ">
 {policy.premiumBreakdown?.factors?.riskFactor ? `${policy.premiumBreakdown.factors.riskFactor}x risk factor` : "Balanced fit"}
 </p>
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="min-w-[130px]">
 <p className="text-sm font-bold text-slate-900 ">{formatCurrency(policy.yearlyPremium || 0)}</p>
 <p className="text-xs text-slate-500 ">per year</p>
 <p className="mt-1 text-xs text-slate-500 ">{formatCurrency(policy.monthlyPremium || 0)} / month</p>
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="flex min-w-[140px] flex-col gap-2">
 <ScorePill tone="emerald">Match: {policy.matchScore}%</ScorePill>
 <ScorePill tone="amber">Confidence: {policy.confidenceScore}%</ScorePill>
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="min-w-[260px] max-w-[320px]">
 <p className="line-clamp-4 text-sm leading-5 text-slate-700 ">{policy.aiReason}</p>
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="min-w-[220px] max-w-[260px] space-y-3">
 <div>
 <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Pros</p>
 <div className="space-y-1.5">
 {(policy.pros || []).slice(0, 2).map((item, itemIndex) => (
 <div key={`${policy.id}-pro-${itemIndex}`} className="flex gap-2 text-xs text-slate-600 ">
 <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-500" />
 <span>{item}</span>
 </div>
 ))}
 </div>
 </div>
 <div>
 <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Cons</p>
 {(policy.cons || []).length ? (
 <div className="space-y-1.5">
 {policy.cons.slice(0, 1).map((item, itemIndex) => (
 <div key={`${policy.id}-con-${itemIndex}`} className="flex gap-2 text-xs text-slate-600 ">
 <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" />
 <span>{item}</span>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-xs text-slate-500 ">No major trade-offs flagged.</p>
 )}
 </div>
 </div>
 </td>
 <td className="px-4 py-4">
 <div className="flex min-w-[130px] flex-col gap-2">
 <button
 type="button"
 onClick={() => toggleCompare(policy.id)}
 className={`rounded-xl border px-3 py-2 text-xs font-bold ${
 compareIds.includes(policy.id)
 ? "border-primary-500 bg-primary-50 text-primary-700 "
 : "border-slate-200 bg-slate-50 text-slate-600 "
 }`}
 >
 {compareIds.includes(policy.id) ? "Selected" : "Compare"}
 </button>
 <Link to={`/policies/${policy.id}`} className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-cyan-600 px-3 py-2 text-xs font-bold text-white">
 Details
 <ArrowRight className="h-3.5 w-3.5" />
 </Link>
 </div>
 </td>
 </tr>
 ))}
 </tbody>
 </table>
 </div>
 </motion.div>

 <ComparisonTable policies={result.recommendations} selectedIds={compareIds} onToggle={toggleCompare} />
 </section>
 )}

 {result && result.recommendations.length === 0 && (
 <div className="rounded-[28px] border-2 border-dashed border-slate-200 bg-slate-50/70 p-10 text-center ">
 <Info className="mx-auto h-8 w-8 text-slate-400" />
 <h3 className="mt-4 text-lg font-bold text-slate-900 ">No recommendations found</h3>
 <p className="mt-2 text-sm text-slate-500 ">Try increasing your budget, broadening categories, or reducing strict filters so the advisor can surface more options.</p>
 </div>
 )}
 </div>
 );
}
