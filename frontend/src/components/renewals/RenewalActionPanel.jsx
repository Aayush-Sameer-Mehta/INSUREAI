import { AlertCircle, ArrowRight, CreditCard, RefreshCw, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Button, Card } from "../common";
import { formatCurrency } from "../../utils/formatters";

export default function RenewalActionPanel({
 policy,
 renewalOffers = [],
 processing,
 error,
 successMessage,
 onPayRenewal,
}) {
 if (!policy) return null;

 const bestOffer = renewalOffers[0];

 return (
 <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
 <Card
 className="overflow-hidden border-0 bg-gradient-to-br from-primary-600 via-primary-700 to-cyan-700 text-white shadow-lg"
 header={
 <div>
 <h3 className="flex items-center gap-2 text-base font-bold text-white">
 <RefreshCw className="h-4 w-4" />
 Complete Renewal
 </h3>
 <p className="mt-1 text-xs text-primary-100">Final review before payment confirmation.</p>
 </div>
 }
 >
 <div className="space-y-4">
 <div className="rounded-[24px] border border-white/15 bg-white/10 p-5 backdrop-blur">
 <p className="text-xs font-bold uppercase tracking-[0.22em] text-primary-100">Payable Now</p>
 <p className="mt-3 text-3xl font-black tracking-tight">{formatCurrency(bestOffer?.premiumAmount || policy.premiumAmount)}</p>
 <p className="mt-2 text-sm text-primary-50">
 Renew {policy.policyName} with {bestOffer?.insurerName || policy.insurerName}.
 </p>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <div className="rounded-2xl bg-white/10 p-4">
 <p className="text-[11px] uppercase tracking-[0.18em] text-primary-100">Current Insurer</p>
 <p className="mt-2 font-semibold">{policy.insurerName}</p>
 </div>
 <div className="rounded-2xl bg-white/10 p-4">
 <p className="text-[11px] uppercase tracking-[0.18em] text-primary-100">Renewal Status</p>
 <p className="mt-2 font-semibold">{policy.status}</p>
 </div>
 </div>
 </div>
 </Card>

 <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
 <Card
 header={
 <div>
 <h3 className="flex items-center gap-2 text-base font-bold text-slate-900 ">
 <CreditCard className="h-4 w-4 text-primary-500" />
 Payment & Confirmation
 </h3>
 <p className="mt-1 text-xs text-slate-500">Razorpay secure checkout opens before renewal is confirmed.</p>
 </div>
 }
 >
 <div className="space-y-4">
 {error && (
 <div className="flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 ">
 <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
 <span>{error}</span>
 </div>
 )}

 {successMessage && (
 <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ">
 <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
 <span>{successMessage}</span>
 </div>
 )}

 <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 ">
 <p className="text-sm font-semibold text-slate-900 ">What happens next</p>
 <div className="mt-3 space-y-2 text-sm text-slate-600 ">
 <p>1. We open Razorpay checkout to collect your payment.</p>
 <p>2. The payment signature is verified before renewal update.</p>
 <p>3. Your renewal receipt and updated policy document become available.</p>
 </div>
 </div>

 <Button onClick={onPayRenewal} loading={processing} className="w-full" icon={CreditCard} iconRight={ArrowRight}>
 Pay & Renew
 </Button>
 </div>
 </Card>
 </motion.div>
 </div>
 );
}
