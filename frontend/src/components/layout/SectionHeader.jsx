import { motion } from "framer-motion";

const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: {
 opacity: 1,
 y: 0,
 transition: { type: "spring", stiffness: 300, damping: 24 },
 },
};

/**
 * Standardized section header with icon, title, subtitle, and optional action slot.
 */
export default function SectionHeader({ icon: Icon, iconBg, title, subtitle, action }) {
 return (
 <motion.div variants={itemVariants} className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 {Icon && (
 <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg || "bg-primary-50 "}`}>
 <Icon className="h-5 w-5 text-primary-500" />
 </div>
 )}
 <div>
 <h2 className="text-lg font-bold text-slate-900 ">{title}</h2>
 {subtitle && (
 <p className="text-xs text-slate-500 ">{subtitle}</p>
 )}
 </div>
 </div>
 {action && <div>{action}</div>}
 </motion.div>
 );
}
