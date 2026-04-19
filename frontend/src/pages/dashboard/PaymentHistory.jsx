import { Link } from "react-router-dom";
import {
 CreditCard,
 IndianRupee,
 ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";
import { Card, Badge } from "../../components/common";
import { formatCurrency } from "../../utils/formatters";

export default function PaymentHistory({ purchasedPolicies, nextPayment }) {
 return (
 <Card
 padding={false}
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20">
 <CreditCard className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-900 ">Payment History</h2>
 <p className="text-xs text-slate-500 ">{purchasedPolicies.length} payment(s)</p>
 </div>
 </div>
 <Link to="/my-policies" className="flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700 ">
 View All <ChevronRight className="h-3.5 w-3.5" />
 </Link>
 </div>
 }
 >
 <div className="divide-y divide-slate-100 ">
 {purchasedPolicies.length > 0 ? (
 purchasedPolicies.slice(0, 5).map((item, idx) => (
 <motion.div
 key={item._id}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.05 }}
 className="flex items-center gap-4 px-6 py-4 transition-colors hover:bg-slate-50/50 "
 >
 <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xs font-bold text-white shadow-md shadow-emerald-500/20">
 <IndianRupee className="h-4 w-4" />
 </div>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-slate-900 ">{item.policy?.name || "Policy"}</p>
 <p className="text-xs text-slate-500 ">
 {new Date(item.purchasedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
 </p>
 </div>
 <div className="text-right">
 <p className="text-sm font-bold text-slate-900 ">{formatCurrency(item.amount)}</p>
 <Badge color="success" className="mt-0.5">Paid</Badge>
 </div>
 </motion.div>
 ))
 ) : (
 <div className="flex flex-col items-center py-12 text-center">
 <CreditCard className="mb-3 h-10 w-10 text-slate-300 " />
 <p className="text-sm font-medium text-slate-400">No payments yet</p>
 </div>
 )}
 </div>

 {nextPayment && (
 <div className="border-t border-slate-100 px-6 py-4 ">
 <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-3 ">
 <div>
 <p className="text-xs font-semibold text-amber-700 ">Next Payment Due</p>
 <p className="text-sm font-bold text-slate-900 ">{nextPayment.policy?.name || "Policy"} — {nextPayment.daysLeft} day(s)</p>
 </div>
 <Link to={`/renewals?purchaseId=${nextPayment._id}`} className="rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">Pay Now</Link>
 </div>
 </div>
 )}
 </Card>
 );
}
