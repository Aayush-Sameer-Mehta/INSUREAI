import { Brain, CircleDollarSign, Lightbulb, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Badge, Card } from "../common";

const TONE_STYLES = {
 success: "border-emerald-200 bg-emerald-50 ",
 warning: "border-amber-200 bg-amber-50 ",
 info: "border-sky-200 bg-sky-50 ",
};

export default function AISuggestions({ insights, offers = [], onComparePlans }) {
 if (!insights) return null;

 return (
 <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
 <Card
 className="overflow-hidden border-0 bg-gradient-to-br from-slate-950 via-slate-900 to-primary-950 text-white shadow-lg"
 header={
 <div>
 <h3 className="flex items-center gap-2 text-base font-bold text-white">
 <Brain className="h-4 w-4 text-cyan-300" />
 AI Renewal Insights
 </h3>
 <p className="mt-1 text-xs text-slate-300">Designed to plug into backend AI suggestions later without changing the UI contract.</p>
 </div>
 }
 >
 <div className="space-y-4">
 <div className="rounded-[24px] border border-white/10 bg-white/10 p-5 backdrop-blur">
 <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-cyan-200">
 <Sparkles className="h-4 w-4" />
 AI Summary
 </div>
 <p className="mt-3 text-base font-semibold leading-7 text-white">{insights.summary}</p>
 </div>

 <div className="space-y-3">
 {insights.recommendations?.map((item, index) => (
 <motion.div
 key={`${item.title}-${index}`}
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className={`rounded-2xl border p-4 ${TONE_STYLES[item.tone] || TONE_STYLES.info}`}
 >
 <div className="flex items-start gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/70 text-slate-900 ">
 {item.tone === "success" ? (
 <CircleDollarSign className="h-5 w-5" />
 ) : (
 <Lightbulb className="h-5 w-5" />
 )}
 </div>
 <div>
 <p className="font-semibold text-slate-900 ">{item.title}</p>
 <p className="mt-1 text-sm leading-6 text-slate-700 ">{item.body}</p>
 </div>
 </div>
 </motion.div>
 ))}
 </div>
 </div>
 </Card>

 <Card
 header={
 <div className="flex items-center justify-between gap-3">
 <div>
 <h3 className="text-base font-bold text-slate-900 ">Suggested Better Plans</h3>
 <p className="mt-1 text-xs text-slate-500">Renewal alternatives ranked for savings and plan continuity.</p>
 </div>
 <Badge color="purple">{offers.length} options</Badge>
 </div>
 }
 >
 {offers.length ? (
 <div className="space-y-3">
 {offers.map((offer) => (
 <div
 key={offer.id}
 className="rounded-2xl border border-slate-200 bg-slate-50 p-4 "
 >
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold text-slate-900 ">{offer.policyName}</p>
 <p className="mt-1 text-sm text-slate-500 ">{offer.insurerName}</p>
 </div>
 {offer.savingsAmount > 0 && <Badge color="success">Save ₹{offer.savingsAmount.toLocaleString("en-IN")}</Badge>}
 </div>

 <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-500 ">
 <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 ">
 Premium ₹{offer.premiumAmount.toLocaleString("en-IN")}
 </span>
 <span className="rounded-full bg-white px-3 py-1.5 ring-1 ring-slate-200 ">
 Coverage ₹{offer.coverageAmount.toLocaleString("en-IN")}
 </span>
 </div>
 </div>
 ))}

 <button
 type="button"
 onClick={onComparePlans}
 className="w-full rounded-2xl border border-primary-200 bg-primary-50 px-4 py-3 text-sm font-semibold text-primary-700 transition hover:bg-primary-100 "
 >
 Compare Recommended Plans
 </button>
 </div>
 ) : (
 <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500 ">
 No alternative plans are available yet. This panel is ready for live AI recommendation data when backend support is added.
 </div>
 )}
 </Card>
 </div>
 );
} 