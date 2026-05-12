import { motion } from "framer-motion";

export default function PageHeader({
 title,
 subtitle,
 icon: Icon,
 actions,
 contextBar,
 className = "",
}) {
 return (
 <motion.div
 initial={{ opacity: 0, y: -16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.4 }}
 className={`space-y-3 ${className}`}
 >
 {contextBar}
 <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
 <div className="flex items-start gap-3">
 {Icon && (
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 ">
 <Icon className="h-5 w-5 text-primary-500" />
 </div>
 )}
 <div>
 <h1 className="section-title">{title}</h1>
 {subtitle && <p className="section-subtitle mt-1">{subtitle}</p>}
 </div>
 </div>
 {actions && <div className="flex items-center gap-3">{actions}</div>}
 </div>
 </motion.div>
 );
}
