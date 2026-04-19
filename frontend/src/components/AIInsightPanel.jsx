import { motion } from "framer-motion";
import {
 Brain,
 ShieldAlert,
 IndianRupee,
 Clock,
 AlertTriangle,
 CheckCircle2,
 FileWarning,
 Sparkles,
 XCircle,
 FileText,
} from "lucide-react";

/* ─── Risk Badge ──────────────────────────────────────── */
export function RiskBadge({ level, score }) {
 const config = {
 High: { bg: "bg-red-100 ", text: "text-red-700 ", border: "border-red-200 " },
 Medium: { bg: "bg-amber-100 ", text: "text-amber-700 ", border: "border-amber-200 " },
 Low: { bg: "bg-emerald-100 ", text: "text-emerald-700 ", border: "border-emerald-200 " },
 };
 const c = config[level] || config.Low;
 const Icon = level === "High" ? XCircle : level === "Medium" ? AlertTriangle : CheckCircle2;

 return (
 <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${c.bg} ${c.text} ${c.border}`}>
 <Icon className="h-3 w-3" />
 {level} Risk {score !== undefined && `(${score})`}
 </span>
 );
}

/* ─── Claim Success Score ─────────────────────────────── */
export function ClaimSuccessScore({ probability }) {
 const p = Number(probability || 0);
 const color = p >= 70 ? "emerald" : p >= 40 ? "amber" : "red";
 const label = p >= 70 ? "High Chance" : p >= 40 ? "Moderate" : "Low Chance";

 return (
 <div className="flex items-center gap-3">
 <div className="relative h-12 w-12">
 <svg className="h-12 w-12 -rotate-90" viewBox="0 0 36 36">
 <path
 d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
 fill="none"
 stroke="currentColor"
 strokeWidth="3"
 className="text-slate-100 "
 />
 <motion.path
 d="M18 2.0845a 15.9155 15.9155 0 0 1 0 31.831 15.9155 15.9155 0 0 1 0-31.831"
 fill="none"
 strokeWidth="3"
 strokeDasharray={`${p}, 100`}
 strokeLinecap="round"
 className={`text-${color}-500`}
 initial={{ strokeDasharray: "0, 100" }}
 animate={{ strokeDasharray: `${p}, 100` }}
 transition={{ duration: 1, ease: "easeOut" }}
 />
 </svg>
 <span className={`absolute inset-0 flex items-center justify-center text-xs font-bold text-${color}-600 }-400`}>
 {p}%
 </span>
 </div>
 <div>
 <p className={`text-sm font-semibold text-${color}-700 }-400`}>{label}</p>
 <p className="text-[11px] text-slate-500">Approval probability</p>
 </div>
 </div>
 );
}

/* ─── Main AI Insight Panel ───────────────────────────── */
export default function AIInsightPanel({ analysis, loading, compact = false }) {
 if (loading) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-blue-50/80 p-5 backdrop-blur-sm "
 >
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 ">
 <Brain className="h-5 w-5 animate-pulse text-indigo-500" />
 </div>
 <div>
 <p className="text-sm font-semibold text-indigo-700 ">Analyzing claim...</p>
 <p className="text-xs text-slate-500">AI is evaluating your claim details</p>
 </div>
 </div>
 <div className="mt-4 space-y-2">
 <div className="skeleton h-4 w-3/4 rounded" />
 <div className="skeleton h-4 w-1/2 rounded" />
 </div>
 </motion.div>
 );
 }

 if (!analysis) return null;

 const {
 approvalProbability,
 suggestedAmount,
 fraudRiskScore,
 fraudRiskLevel,
 flags,
 reasoning,
 missingDocuments,
 estimatedProcessingTime,
 } = analysis;

 return (
 <motion.div
 initial={{ opacity: 0, y: 12 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className="rounded-2xl border border-indigo-200/70 bg-gradient-to-br from-indigo-50/80 via-white/80 to-blue-50/80 p-5 shadow-lg shadow-indigo-500/5 backdrop-blur-sm "
 >
 {/* Header */}
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2.5">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
 <Brain className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <h4 className="text-sm font-bold text-slate-900 ">AI Claim Analysis</h4>
 <p className="text-[11px] text-slate-500">Powered by InsureAI Engine</p>
 </div>
 </div>
 <RiskBadge level={fraudRiskLevel} score={fraudRiskScore} />
 </div>

 {/* Key Metrics */}
 <div className={`mt-4 grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
 <MetricCard
 icon={Sparkles}
 label="Approval"
 value={`${approvalProbability}%`}
 color={approvalProbability >= 70 ? "emerald" : approvalProbability >= 40 ? "amber" : "red"}
 />
 <MetricCard
 icon={IndianRupee}
 label="Suggested"
 value={`₹${Number(suggestedAmount || 0).toLocaleString("en-IN")}`}
 color="blue"
 />
 <MetricCard
 icon={ShieldAlert}
 label="Fraud Risk"
 value={`${fraudRiskScore}%`}
 color={fraudRiskScore >= 70 ? "red" : fraudRiskScore >= 40 ? "amber" : "emerald"}
 />
 <MetricCard
 icon={Clock}
 label="Est. Time"
 value={estimatedProcessingTime?.split("(")[0]?.trim() || "3-5 days"}
 color="violet"
 />
 </div>

 {/* Approval Probability Bar */}
 <div className="mt-4">
 <div className="flex items-center justify-between text-xs mb-1.5">
 <span className="font-medium text-slate-600 ">Approval Probability</span>
 <span className="font-bold text-slate-900 ">{approvalProbability}%</span>
 </div>
 <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 ">
 <motion.div
 initial={{ width: 0 }}
 animate={{ width: `${approvalProbability}%` }}
 transition={{ duration: 1, ease: "easeOut" }}
 className={`h-full rounded-full ${
 approvalProbability >= 70
 ? "bg-gradient-to-r from-emerald-400 to-emerald-600"
 : approvalProbability >= 40
 ? "bg-gradient-to-r from-amber-400 to-amber-600"
 : "bg-gradient-to-r from-red-400 to-red-600"
 }`}
 />
 </div>
 </div>

 {/* Flags */}
 {flags && flags.length > 0 && (
 <div className="mt-4">
 <p className="mb-2 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
 <AlertTriangle className="h-3 w-3 text-amber-500" />
 Issues Detected ({flags.length})
 </p>
 <div className="flex flex-wrap gap-1.5">
 {flags.map((flag, i) => (
 <span
 key={i}
 className="rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-medium text-amber-700 "
 >
 {flag}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* Missing Documents */}
 {missingDocuments && missingDocuments.length > 0 && (
 <div className="mt-4">
 <p className="mb-2 text-xs font-semibold text-slate-600 flex items-center gap-1.5">
 <FileText className="h-3 w-3 text-blue-500" />
 Suggested Documents
 </p>
 <div className="flex flex-wrap gap-1.5">
 {missingDocuments.map((doc, i) => (
 <span
 key={i}
 className="rounded-lg border border-blue-200 bg-blue-50 px-2.5 py-1 text-[11px] font-medium text-blue-700 "
 >
 {doc}
 </span>
 ))}
 </div>
 </div>
 )}

 {/* AI Reasoning */}
 {reasoning && (
 <div className="mt-4 rounded-xl bg-white/60 p-3 ">
 <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">AI Reasoning</p>
 <p className="text-xs leading-relaxed text-slate-700 ">{reasoning}</p>
 </div>
 )}
 </motion.div>
 );
}

/* ─── Small Metric Card ───────────────────────────────── */
function MetricCard({ icon: Icon, label, value, color }) {
 return (
 <div className="rounded-xl border border-slate-100 bg-white/70 p-3 text-center ">
 <Icon className={`mx-auto mb-1.5 h-4 w-4 text-${color}-500`} />
 <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">{label}</p>
 <p className={`mt-0.5 text-sm font-bold text-${color}-700 }-400 truncate`}>{value}</p>
 </div>
 );
}
