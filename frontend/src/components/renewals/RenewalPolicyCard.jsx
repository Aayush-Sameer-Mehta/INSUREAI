import { Calendar, Download, FileText, IndianRupee, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge, Button, Card } from "../common";
import { formatCurrency, toTitleCase } from "../../utils/formatters";

function formatDate(value) {
 if (!value) return "Not available";
 return new Date(value).toLocaleDateString("en-IN", {
 day: "numeric",
 month: "short",
 year: "numeric",
 });
}

export default function RenewalPolicyCard({
 policy,
 loading = false,
 onRenewNow,
 onComparePlans,
 onDownloadPolicy,
}) {
 if (loading) {
 return (
 <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
 {[0, 1].map((item) => (
 <div key={item} className="animate-pulse rounded-[28px] border border-slate-200 bg-white p-6 ">
 <div className="h-5 w-32 rounded bg-slate-200 " />
 <div className="mt-4 h-8 w-2/3 rounded bg-slate-200 " />
 <div className="mt-6 space-y-3">
 <div className="h-16 rounded-2xl bg-slate-100 " />
 <div className="h-16 rounded-2xl bg-slate-100 " />
 <div className="h-16 rounded-2xl bg-slate-100 " />
 </div>
 </div>
 ))}
 </div>
 );
 }

 if (!policy) return null;

 return (
 <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
 <Card
 header={
 <div className="flex items-center justify-between gap-3">
 <div>
 <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 ">
 <ShieldCheck className="h-4 w-4 text-primary-500" />
 Policy Details
 </h3>
 <p className="mt-1 text-xs text-slate-500">Review your renewal-ready policy before proceeding.</p>
 </div>
 <Badge color={policy.statusTone || "success"} dot>
 {policy.status}
 </Badge>
 </div>
 }
 >
 <div className="rounded-[24px] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-5 ">
 <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-400">Policy Type</p>
 <h4 className="mt-2 text-2xl font-black tracking-tight text-slate-900 ">
 {policy.policyName}
 </h4>
 <div className="mt-2 flex flex-wrap gap-2">
 <Badge color="info">{toTitleCase(policy.insuranceType)}</Badge>
 {policy.policyNumber && <Badge>{policy.policyNumber}</Badge>}
 </div>
 </div>

 <div className="mt-5 grid gap-3 sm:grid-cols-2">
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Expiry Date</p>
 <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 ">
 <Calendar className="h-4 w-4 text-primary-500" />
 {formatDate(policy.expiryDate)}
 </p>
 </div>
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Premium Amount</p>
 <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-slate-900 ">
 <IndianRupee className="h-4 w-4 text-primary-500" />
 {formatCurrency(policy.premiumAmount)}
 </p>
 </div>
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Insurer Name</p>
 <p className="mt-2 text-sm font-semibold text-slate-900 ">{policy.insurerName}</p>
 </div>
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">Coverage</p>
 <p className="mt-2 text-sm font-semibold text-slate-900 ">
 {policy.coverageAmount ? formatCurrency(policy.coverageAmount) : "Not shared"}
 </p>
 </div>
 </div>
 </Card>

 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
 <Card
 variant="interactive"
 header={
 <div>
 <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 ">
 <FileText className="h-4 w-4 text-primary-500" />
 Renewal Actions
 </h3>
 <p className="mt-1 text-xs text-slate-500">Continue your renewal or review better options.</p>
 </div>
 }
 >
 <div className="space-y-4">
 <Button onClick={onRenewNow} className="w-full" icon={ShieldCheck}>
 Renew Now
 </Button>
 <Button onClick={onComparePlans} variant="ghost" className="w-full">
 Compare Plans
 </Button>
 <Button
 onClick={onDownloadPolicy}
 variant="secondary"
 className="w-full"
 icon={Download}
 disabled={!policy.policyDocumentPath}
 >
 Download Policy
 </Button>

 {policy.id && (
 <Link
 to={`/policies/${policy.id}`}
 className="inline-flex w-full items-center justify-center rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 "
 >
 View Full Policy
 </Link>
 )}
 </div>
 </Card>
 </motion.div>
 </div>
 );
}
