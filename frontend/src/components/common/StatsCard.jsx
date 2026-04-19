import { motion } from "framer-motion";
import { TrendingUp, TrendingDown } from "lucide-react";

export default function StatsCard({
 icon: Icon,
 label,
 value,
 trend,
 trendLabel,
 gradient = "from-primary-500 to-primary-700",
 bg = "bg-primary-50 ",
 iconColor = "text-primary-600 ",
 small = false,
 className = "",
}) {
 return (
 <motion.article
 whileHover={{ y: -4, transition: { duration: 0.2 } }}
 className={`stat-card group ${className}`}
 >
 {/* Hover glow */}
 <div
 className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${gradient} opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20`}
 />

 <div className="relative z-10">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-label">{label}</p>
 <p
 className={`mt-2 font-bold tracking-tight ${small ? "text-sm" : "text-2xl"} ${iconColor}`}
 >
 {value}
 </p>
 {/* Trend indicator */}
 {trend !== undefined && (
 <div className={`mt-1.5 ${trend >= 0 ? "trend-up" : "trend-down"}`}>
 {trend >= 0 ? (
 <TrendingUp className="h-3 w-3" />
 ) : (
 <TrendingDown className="h-3 w-3" />
 )}
 <span>
 {trend >= 0 ? "+" : ""}
 {trend}%
 </span>
 {trendLabel && (
 <span className="ml-1 text-slate-500 ">
 {trendLabel}
 </span>
 )}
 </div>
 )}
 </div>
 <div
 className={`rounded-xl ${bg} p-3 transition-all duration-300 group-hover:scale-110`}
 >
 {Icon && <Icon className={`h-5 w-5 ${iconColor}`} />}
 </div>
 </div>
 </div>

 {/* Gradient accent */}
 <div
 className={`absolute bottom-0 left-0 h-1 w-full rounded-b-2xl bg-gradient-to-r ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
 />
 </motion.article>
 );
}
