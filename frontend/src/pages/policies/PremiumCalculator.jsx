import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
 Calculator,
 User,
 IndianRupee,
 Clock,
 Cigarette,
 Car,
 Bike,
 HeartPulse,
 Shield,
 Plane,
 Home as HomeIcon,
 TrendingUp,
 ArrowRight,
 Sparkles,
 CheckCircle2,
 Info,
} from "lucide-react";
import { formatCurrency } from "../../utils/formatters";
import { calculatePremium } from "../../services/aiService";

/* ─── insurance type config ──────────────────────────── */
const INSURANCE_TYPES = [
 { id: "life", label: "Life", icon: Shield, gradient: "from-violet-500 to-violet-700", rate: 2.5 },
 { id: "health", label: "Health", icon: HeartPulse, gradient: "from-rose-500 to-rose-700", rate: 3.2 },
 { id: "car", label: "Car", icon: Car, gradient: "from-blue-500 to-blue-700", rate: 2.0 },
 { id: "bike", label: "Bike", icon: Bike, gradient: "from-emerald-500 to-emerald-700", rate: 1.5 },
 { id: "travel", label: "Travel", icon: Plane, gradient: "from-amber-500 to-amber-700", rate: 1.8 },
 { id: "home", label: "Home", icon: HomeIcon, gradient: "from-cyan-500 to-cyan-700", rate: 1.2 },
];

/* ─── animation variants ─────────────────────────────── */




/* ─── preset coverage amounts ────────────────────────── */
const PRESETS = [
 { label: "₹5L", value: 500000 },
 { label: "₹10L", value: 1000000 },
 { label: "₹25L", value: 2500000 },
 { label: "₹50L", value: 5000000 },
 { label: "₹1Cr", value: 10000000 },
];

/* ═══════════════════════════════════════════════════════ */
export default function PremiumCalculator() {
 const [form, setForm] = useState({
 type: "life",
 age: "",
 coverage: "",
 term: "",
 smoker: false,
 });
 const [result, setResult] = useState(null);

 const selectedType = INSURANCE_TYPES.find((t) => t.id === form.type) || INSURANCE_TYPES[0];
 const age = Number(form.age);
 const coverage = Number(form.coverage);
 const term = Number(form.term);
 const hasRequiredValues = age > 0 && coverage > 0 && term > 0;

 useEffect(() => {
 let cancelled = false;

 async function generateEstimate() {
 if (!hasRequiredValues) {
 if (!cancelled) {
 setResult(null);
 }
 return;
 }

 const basePremium = Math.round((coverage / 1000) * selectedType.rate);

 try {
 const premium = await calculatePremium({
 basePremium,
 coverageAmount: coverage,
 policyCoverage: coverage,
 termYears: term,
 age,
 riskScore: form.smoker ? 55 : 30,
 smoking: form.smoker,
 claimHistory: 0,
 drivingHistory: "good",
 });

 if (!cancelled) {
 setResult({
 annual: premium.adjustedAnnualPremium,
 monthly: premium.monthlyPremium,
 quarterly: premium.quarterlyPremium,
 daily: Math.round(premium.adjustedAnnualPremium / 365),
 savingsPercent: form.smoker ? 0 : 18,
 factors: premium.factors,
 });
 }
 } catch {
 if (!cancelled) {
 setResult(null);
 }
 }
 }

 generateEstimate();

 return () => {
 cancelled = true;
 };
 }, [age, coverage, term, hasRequiredValues, form.smoker, selectedType.rate]);

 const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

 return (
 <div className="space-y-8">
 {/* ─── HEADER ───────────────────────────────────── */}
 <div initial="hidden" animate="visible">
 <div className="flex items-center gap-3">
 <div
 className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20"
 >
 <Calculator className="h-6 w-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
 Premium Calculator
 </h1>
 <p className="text-sm text-slate-500 ">
 Get an instant premium estimate tailored to your needs
 </p>
 </div>
 </div>
 </div>

 <div className="grid gap-8 lg:grid-cols-5">
 {/* ─── LEFT: FORM ───────────────────────────────── */}
 <div
 initial="hidden"
 animate="visible"
 className="space-y-6 lg:col-span-3"
 >
 {/* Insurance Type Selector */}
 <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ">
 <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
 <Shield className="h-4 w-4 text-indigo-500" />
 Insurance Type
 </label>
 <div initial="hidden" animate="visible" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
 {INSURANCE_TYPES.map((type) => {
 const Icon = type.icon;
 const isActive = form.type === type.id;
 return (
 <button
 key={type.id}
 type="button"
 onClick={() => setField("type", type.id)}
 className={`flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-xs font-medium transition
 ${isActive
 ? "border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md shadow-indigo-500/10 "
 : "border-slate-200 text-slate-600 hover:border-slate-300 "}`}
 >
 <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${isActive ? `bg-gradient-to-br ${type.gradient} text-white` : "bg-slate-100 "}`}>
 <Icon className="h-4 w-4" />
 </div>
 {type.label}
 </button>
 );
 })}
 </div>
 </div>

 {/* Form Fields */}
 <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ">
 <div className="grid gap-5 sm:grid-cols-2">
 {/* Age */}
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
 <User className="h-4 w-4 text-indigo-500" /> Your Age
 </label>
 <input
 type="number"
 placeholder="e.g. 30"
 min="18"
 max="80"
 value={form.age}
 onChange={(e) => setField("age", e.target.value)}
 className="field"
 />
 <p className="mt-1 text-xs text-slate-400">Between 18 – 80 years</p>
 </div>

 {/* Term */}
 <div>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
 <Clock className="h-4 w-4 text-indigo-500" /> Policy Term
 </label>
 <input
 type="number"
 placeholder="e.g. 20"
 min="1"
 max="40"
 value={form.term}
 onChange={(e) => setField("term", e.target.value)}
 className="field"
 />
 <p className="mt-1 text-xs text-slate-400">1 – 40 years</p>
 </div>

 {/* Coverage */}
 <div className="sm:col-span-2">
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
 <IndianRupee className="h-4 w-4 text-indigo-500" /> Coverage Amount
 </label>
 <input
 type="number"
 placeholder="e.g. 5000000"
 value={form.coverage}
 onChange={(e) => setField("coverage", e.target.value)}
 className="field"
 />
 {/* presets */}
 <div className="mt-2 flex flex-wrap gap-2">
 {PRESETS.map((p) => (
 <button
 key={p.value}
 type="button"
 onClick={() => setField("coverage", String(p.value))}
 className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition
 ${Number(form.coverage) === p.value
 ? "bg-indigo-600 text-white shadow-sm"
 : "bg-slate-100 text-slate-600 hover:bg-slate-200 "}`}
 >
 {p.label}
 </button>
 ))}
 </div>
 </div>

 {/* Smoker Toggle */}
 <div className="sm:col-span-2">
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
 <Cigarette className="h-4 w-4 text-indigo-500" /> Tobacco Usage
 </label>
 <div className="flex gap-3">
 {[
 { label: "Non-Smoker", val: false },
 { label: "Smoker", val: true },
 ].map((opt) => (
 <button
 key={String(opt.val)}
 type="button"
 onClick={() => setField("smoker", opt.val)}
 className={`flex-1 rounded-xl border-2 px-4 py-3 text-sm font-medium transition
 ${form.smoker === opt.val
 ? "border-indigo-500 bg-indigo-50 text-indigo-700 "
 : "border-slate-200 text-slate-600 hover:border-slate-300 "}`}
 >
 {opt.label}
 </button>
 ))}
 </div>
 </div>
 </div>
 </div>
 </div>

 {/* ─── RIGHT: RESULTS ───────────────────────────── */}
 <div className="lg:col-span-2">
 <>
 {result ? (
 <div
 key={`${result.annual}-${form.type}`}
 initial="hidden"
 animate="visible"
 exit="exit"
 className="sticky top-24 space-y-4"
 >
 {/* main result card */}
 <div className={`overflow-hidden rounded-2xl bg-gradient-to-br ${selectedType.gradient} p-6 text-white shadow-xl`}>
 <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/5" />
 <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-white/5" />

 <div className="relative z-10">
 <p className="flex items-center gap-2 text-sm text-white/80">
 <Sparkles className="h-4 w-4" />
 Estimated Premium
 </p>

 <div className="mt-3">
 <p className="text-xs uppercase tracking-wider text-white/60">Annual</p>
 <p
 key={result.annual}
 className="text-4xl font-extrabold tracking-tight"
 >
 {formatCurrency(result.annual)}
 </p>
 </div>

 <div className="mt-4 grid grid-cols-3 gap-2">
 <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
 <p className="text-[10px] uppercase text-white/60">Monthly</p>
 <p className="text-sm font-bold">{formatCurrency(result.monthly)}</p>
 </div>
 <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
 <p className="text-[10px] uppercase text-white/60">Quarterly</p>
 <p className="text-sm font-bold">{formatCurrency(result.quarterly)}</p>
 </div>
 <div className="rounded-lg bg-white/10 px-3 py-2 backdrop-blur-sm">
 <p className="text-[10px] uppercase text-white/60">Per Day</p>
 <p className="text-sm font-bold">{formatCurrency(result.daily)}</p>
 </div>
 </div>

 {result.savingsPercent > 0 && (
 <div
 className="mt-4 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs backdrop-blur-sm"
 >
 <TrendingUp className="h-4 w-4 text-emerald-300" />
 <span>You save ~{result.savingsPercent}% as a non-smoker!</span>
 </div>
 )}
 </div>
 </div>

 {/* breakdown */}
 <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ">
 <h3 className="mb-3 text-sm font-semibold text-slate-700 ">Premium Breakdown</h3>
 <div className="space-y-2.5 text-sm">
 {[
 { label: "Insurance Type", value: selectedType.label },
 { label: "Age Group", value: Number(form.age) < 30 ? "Young" : Number(form.age) < 45 ? "Adult" : Number(form.age) < 60 ? "Senior" : "Elder" },
 { label: "Coverage", value: formatCurrency(Number(form.coverage)) },
 { label: "Policy Term", value: `${form.term} years` },
 { label: "Tobacco Factor", value: form.smoker ? "+30% loading" : "No loading" },
 { label: "Age Factor", value: `${result?.factors?.ageFactor || 1}x` },
 { label: "Term Factor", value: `${result?.factors?.termFactor || 1}x` },
 { label: "Risk Factor", value: `${result?.factors?.riskFactor || 1}x` },
 ].map((item) => (
 <div key={item.label} className="flex justify-between">
 <span className="text-slate-500 ">{item.label}</span>
 <span className="font-medium text-slate-800 ">{item.value}</span>
 </div>
 ))}
 </div>
 </div>

 {/* CTA */}
 <div>
 <Link
 to={`/policies?category=${form.type}`}
 className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-700"
 >
 View {selectedType.label} Insurance Plans
 <ArrowRight className="h-4 w-4" />
 </Link>
 </div>
 </div>
 ) : (
 <div
 key="empty"
 initial="hidden"
 animate="visible"
 exit="exit"
 className="sticky top-24 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50 p-10 text-center "
 >
 <div
 className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 "
 >
 <Calculator className="h-8 w-8 text-indigo-500" />
 </div>
 <h3 className="text-lg font-semibold text-slate-700 ">
 Your estimate will appear here
 </h3>
 <p className="mt-1 text-sm text-slate-500">
 Fill in your details to get an instant premium quote
 </p>
 <div className="mt-4 space-y-1.5 text-left">
 {[
 "Select an insurance type",
 "Enter your age",
 "Choose coverage amount",
 "Set policy term",
 ].map((step, i) => (
 <div key={i} className="flex items-center gap-2 text-xs text-slate-400">
 <CheckCircle2 className={`h-3.5 w-3.5 ${(i === 0 && form.type) ||
 (i === 1 && form.age) ||
 (i === 2 && form.coverage) ||
 (i === 3 && form.term)
 ? "text-emerald-500"
 : "text-slate-300 "
 }`} />
 <span>{step}</span>
 </div>
 ))}
 </div>
 </div>
 )}
 </>
 </div>
 </div>

 {/* ─── INFO NOTE ────────────────────────────────── */}
 <div
 className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 "
 >
 <Info className="mt-0.5 h-5 w-5 shrink-0 text-blue-500" />
 <div className="text-sm text-slate-600 ">
 <p className="font-semibold text-slate-800 ">Disclaimer</p>
 <p className="mt-0.5">
 This is an indicative estimate only. Actual premiums may vary based on medical history,
 lifestyle, and underwriting by the insurance company. Contact our advisors for an exact quote.
 </p>
 </div>
 </div>
 </div>
 );
}
