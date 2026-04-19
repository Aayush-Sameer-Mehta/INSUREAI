import { motion } from "framer-motion";
import { Gauge } from "lucide-react";

export default function RiskGauge({ score }) {
 const label = score >= 70 ? "Low" : score >= 40 ? "Medium" : "High";
 const color =
 score >= 70 ? "text-emerald-500" : score >= 40 ? "text-amber-500" : "text-red-500";
 const bg =
 score >= 70
 ? "from-emerald-400 to-teal-500"
 : score >= 40
 ? "from-amber-400 to-orange-500"
 : "from-red-500 to-rose-600";
 const ring =
 score >= 70
 ? "ring-emerald-200 "
 : score >= 40
 ? "ring-amber-200 "
 : "ring-red-200 ";

 return (
 <div className="flex flex-col items-center gap-2">
 <div className={`relative flex h-20 w-20 items-center justify-center rounded-full ring-4 ${ring}`}>
 <svg className="absolute inset-0" viewBox="0 0 80 80">
 <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="6" className="text-slate-100 " />
 <motion.circle
 cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
 className={color} stroke="currentColor"
 strokeDasharray={`${(score / 100) * 213.6} 213.6`}
 transform="rotate(-90 40 40)"
 initial={{ strokeDasharray: "0 213.6" }}
 animate={{ strokeDasharray: `${(score / 100) * 213.6} 213.6` }}
 transition={{ duration: 1.5, ease: "easeOut" }}
 />
 </svg>
 <span className={`text-lg font-bold ${color}`}>{score}</span>
 </div>
 <span className={`inline-flex items-center gap-1 rounded-full bg-gradient-to-r ${bg} px-3 py-1 text-xs font-bold text-white shadow-md`}>
 <Gauge className="h-3 w-3" />
 {label} Risk
 </span>
 </div>
 );
}
