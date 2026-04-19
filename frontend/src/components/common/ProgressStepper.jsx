import { motion } from "framer-motion";
import { Check } from "lucide-react";

export default function ProgressStepper({
 steps,
 currentStep,
 className = "",
}) {
 const currentIdx = steps.findIndex((s) => s.key === currentStep);

 return (
 <div className={`flex w-full items-center ${className}`} role="list" aria-label="Progress">
 {steps.map((step, i) => {
 const isCompleted = i < currentIdx;
 const isActive = i === currentIdx;
 const isLast = i === steps.length - 1;
 const Icon = step.icon;

 return (
 <div key={step.key} className={`flex items-center ${isLast ? "shrink-0" : "flex-1"}`} role="listitem">
 {/* Step circle */}
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ delay: i * 0.1 }}
 className={`relative flex h-7 w-7 shrink-0 sm:h-8 sm:w-8 items-center justify-center rounded-full text-xs font-bold transition-all duration-300 ${
 isCompleted
 ? `${step.completedBg || "bg-emerald-500"} text-white shadow-sm`
 : isActive
 ? `${step.activeBg || "bg-primary-600"} text-white shadow-md shadow-primary-500/30 ring-4 ring-primary-100`
 : "bg-slate-100 text-slate-400 "
 }`}
 title={step.label}
 >
 {isCompleted ? (
 <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
 ) : Icon ? (
 <Icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
 ) : (
 i + 1
 )}
 </motion.div>

 {/* Step label */}
 {step.label && (
 <span
 className={`ml-1.5 sm:ml-2 hidden text-[10px] sm:text-xs font-medium lg:inline truncate max-w-[50px] sm:max-w-none ${
 isActive
 ? "text-primary-700 "
 : isCompleted
 ? "text-emerald-600 "
 : "text-slate-400"
 }`}
 >
 {step.label}
 </span>
 )}

 {/* Connector line */}
 {!isLast && (
 <div
 className={`mx-1 sm:mx-2 min-w-[4px] flex-1 h-0.5 rounded transition-colors duration-300 ${
 isCompleted
 ? "bg-emerald-400"
 : "bg-slate-200 "
 }`}
 />
 )}
 </div>
 );
 })}
 </div>
 );
}
