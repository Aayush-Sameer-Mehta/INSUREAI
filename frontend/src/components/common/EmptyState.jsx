import { motion } from "framer-motion";
import { PackageOpen } from "lucide-react";
import Button from "./Button";

export default function EmptyState({
 icon: Icon = PackageOpen,
 title = "No data found",
 description = "",
 actionLabel,
 actionIcon,
 onAction,
 actionVariant = "primary",
 className = "",
}) {
 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.3 }}
 className={`empty-state ${className}`}
 >
 <div className="empty-state-icon">
 <Icon className="h-8 w-8 text-slate-400" />
 </div>
 <h3 className="empty-state-title">{title}</h3>
 {description && <p className="empty-state-text">{description}</p>}
 {actionLabel && onAction && (
 <div className="mt-5">
 <Button
 variant={actionVariant}
 icon={actionIcon}
 onClick={onAction}
 >
 {actionLabel}
 </Button>
 </div>
 )}
 </motion.div>
 );
}
