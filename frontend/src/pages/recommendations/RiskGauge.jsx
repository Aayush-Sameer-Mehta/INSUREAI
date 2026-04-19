import { motion } from "framer-motion";

export const RISK_STYLES = {
 Low: "border-emerald-200 bg-emerald-50 text-emerald-700 ",
 Medium: "border-amber-200 bg-amber-50 text-amber-700 ",
 High: "border-rose-200 bg-rose-50 text-rose-700 ",
};

export default function RiskGauge({ score, riskLevel }) {
 const safeScore = Math.max(0, Math.min(Number(score || 0), 100));
 const color = riskLevel === "High" ? "#ef4444" : riskLevel === "Low" ? "#10b981" : "#f59e0b";
 const radius = 80;
 const arc = Math.PI * radius;

 return (
 <div className="relative flex flex-col items-center">
 <svg width="210" height="130" viewBox="0 0 210 130">
 <path d="M 25 105 A 80 80 0 0 1 185 105" fill="none" stroke="currentColor" strokeWidth="14" strokeLinecap="round" className="text-slate-200 " />
 <motion.path
 d="M 25 105 A 80 80 0 0 1 185 105"
 fill="none"
 stroke={color}
 strokeWidth="14"
 strokeLinecap="round"
 strokeDasharray={arc}
 initial={{ strokeDashoffset: arc }}
 animate={{ strokeDashoffset: arc - (safeScore / 100) * arc }}
 transition={{ duration: 0.9, ease: "easeOut" }}
 />
 </svg>
 <div className="absolute top-10 text-center">
 <p className="text-4xl font-black tracking-tight text-slate-950 ">{safeScore}</p>
 <p className="text-[11px] uppercase tracking-[0.24em] text-slate-400">Risk Score</p>
 </div>
 <span className={`mt-2 rounded-full border px-3 py-1 text-xs font-bold ${RISK_STYLES[riskLevel] || RISK_STYLES.Medium}`}>
 {riskLevel} Risk
 </span>
 </div>
 );
}

export function BreakdownBar({ item }) {
 const pct = Math.max(0, Math.min((Number(item.score || 0) / Math.max(Number(item.maxScore || 1), 1)) * 100, 100));
 const color = pct < 35 ? "bg-emerald-500" : pct < 70 ? "bg-amber-500" : "bg-rose-500";

 return (
 <div className="space-y-1.5">
 <div className="flex items-center justify-between text-xs text-slate-600 ">
 <span>{item.label}</span>
 <span className="font-semibold text-slate-900 ">{item.score}/{item.maxScore}</span>
 </div>
 <div className="h-2 overflow-hidden rounded-full bg-slate-100 ">
 <motion.div className={`h-full rounded-full ${color}`} initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.6 }} />
 </div>
 </div>
 );
}
