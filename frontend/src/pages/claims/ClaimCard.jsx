import {
 Clock,
 Search,
 FileCheck,
 Ban,
 ClipboardList,
 AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, Badge, ProgressStepper } from "../../components/common";
import { formatCurrency } from "../../utils/formatters";

export const STATUS_CONFIG = {
 Submitted: { icon: Clock, color: "warning", label: "Submitted" },
 "Under Review": { icon: Search, color: "info", label: "Under Review" },
 Approved: { icon: FileCheck, color: "success", label: "Approved" },
 Rejected: { icon: Ban, color: "danger", label: "Rejected" },
 Paid: { icon: ClipboardList, color: "success", label: "Paid" },
};

export const CLAIM_STEPS = [
 { key: "Submitted", label: "Submitted", icon: Clock },
 { key: "Under Review", label: "Under Review", icon: Search },
 { key: "Approved", label: "Approved", icon: FileCheck },
 { key: "Paid", label: "Paid", icon: ClipboardList },
];

export default function ClaimCard({ claim, index, isPast }) {
 const config = STATUS_CONFIG[claim.status] || STATUS_CONFIG.Submitted;

 return (
 <motion.div
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ delay: index * 0.05 }}
 >
 <Card variant={isPast ? "glass" : "interactive"} className={isPast ? "opacity-75" : ""}>
 <div className="flex items-start justify-between mb-4">
 <div>
 <Badge color={config.color} dot className="mb-2">
 {config.label}
 </Badge>
 <h3 className="font-bold text-slate-900 line-clamp-1">
 {claim.policy?.name || "Unknown Policy"}
 </h3>
 <p className="text-xs text-slate-500 mt-1">
 Filed on {new Date(claim.createdAt).toLocaleDateString()} · {claim.claimId}
 </p>
 </div>
 <p className="text-lg font-bold text-slate-900 ">
 {formatCurrency(claim.claimAmount)}
 </p>
 </div>

 {claim.fraudRiskLevel && claim.fraudRiskLevel !== "Low Risk" && (
 <div className={`mb-3 flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium ${
 claim.fraudRiskLevel === "High Risk"
 ? "bg-red-50 text-red-700 "
 : "bg-amber-50 text-amber-700 "
 }`}>
 <AlertCircle className="h-3 w-3" />
 {claim.fraudRiskLevel} · Score: {claim.fraudRiskScore}
 </div>
 )}

 <div className="mt-4 rounded-xl bg-slate-50 p-3 ">
 <p className="text-sm font-medium text-slate-700 ">Description</p>
 <p className="text-xs text-slate-500 mt-1 line-clamp-2">{claim.reason}</p>
 </div>

 {!isPast && (
 <div className="mt-5 border-t border-slate-100 pt-4">
 <ProgressStepper
 steps={CLAIM_STEPS}
 currentStep={
 ["Submitted", "Under Review", "Approved", "Paid"].includes(claim.status)
 ? claim.status
 : "Submitted"
 }
 />
 </div>
 )}
 </Card>
 </motion.div>
 );
}
