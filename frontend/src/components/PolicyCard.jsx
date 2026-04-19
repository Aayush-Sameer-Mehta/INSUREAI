import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Star, ArrowRight, ShieldPlus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { formatCurrency, toTitleCase } from "../utils/formatters";
import { CATEGORY_ICONS, CATEGORY_GRADIENTS } from "../utils/categoryConfig";

// Mock add-ons for Motor/Car categories to fulfill UI requirements
const MOCK_ADDONS = {
 car: [
 { id: "zero-dep", label: "Zero Dep", price: 1500 },
 { id: "engine", label: "Engine Protect", price: 800 },
 { id: "rsa", label: "RSA", price: 300 },
 ],
 bike: [
 { id: "zero-dep", label: "Zero Dep", price: 500 },
 { id: "rsa", label: "RSA", price: 150 },
 ],
 health: [
 { id: "critical", label: "Critical Illness", price: 2000 },
 { id: "room", label: "Room Upgrade", price: 1200 },
 ],
 life: [
 { id: "ci-rider", label: "Critical Illness", price: 1500 },
 { id: "ad-rider", label: "Accidental Death", price: 800 },
 ],
 travel: [
 { id: "adventure", label: "Adventure Sports", price: 500 },
 { id: "cancel", label: "Trip Cancellation", price: 300 },
 ],
 home: [
 { id: "earthquake", label: "Earthquake Cover", price: 1000 },
 { id: "burglary", label: "Burglary Cover", price: 800 },
 ],
 business: [
 { id: "cyber", label: "Cyber Risk", price: 5000 },
 { id: "fire", label: "Fire Cover", price: 2000 },
 ],
 personal_accident: [
 { id: "hospital", label: "Hospital Cash", price: 400 },
 { id: "education", label: "Education Grant", price: 200 },
 ],
 group: [
 { id: "maternity", label: "Maternity", price: 1500 },
 { id: "parents", label: "Dependant Parents", price: 3000 },
 ],
 motor_commercial: [
 { id: "zero-dep", label: "Zero Dep", price: 3000 },
 { id: "downtime", label: "Downtime Protect", price: 1500 },
 ],
 liability: [{ id: "legal", label: "Legal Fees", price: 2000 }],
 specialty: [{ id: "theft", label: "Theft Protection", price: 500 }],
 agriculture: [{ id: "harvest", label: "Post Harvest", price: 100 }],
 micro_social: [{ id: "family", label: "Family Cover", price: 200 }],
};

const PolicyCard = React.memo(function PolicyCard({ policy }) {
 const prefersReducedMotion = useReducedMotion();
 const Icon = CATEGORY_ICONS[policy.category] || CATEGORY_ICONS.life;
 const rating = Number(policy.ratingAverage || 0).toFixed(1);

 const availableAddons = useMemo(() => MOCK_ADDONS[policy.category] || [], [policy.category]);
 const [selectedAddons, setSelectedAddons] = useState(new Set());

 const toggleAddon = (e, addonId) => {
 e.preventDefault(); // Prevent navigating if wrapped in Link
 const newSet = new Set(selectedAddons);
 if (newSet.has(addonId)) newSet.delete(addonId);
 else newSet.add(addonId);
 setSelectedAddons(newSet);
 };

 const totalPremium = useMemo(() => {
 let total = policy.price || 0;
 availableAddons.forEach((addon) => {
 if (selectedAddons.has(addon.id)) {
 total += addon.price;
 }
 });
 return total;
 }, [availableAddons, policy.price, selectedAddons]);

 return (
 <motion.article
 initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
 whileInView={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
 viewport={{ once: true, margin: "-25px" }}
 whileHover={prefersReducedMotion ? undefined : { y: -4 }}
 transition={prefersReducedMotion ? undefined : { duration: 0.2 }}
 className="group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:shadow-xl overflow-hidden"
 >
 {/* ─── HEADER ─── */}
 <div className="p-5 pb-4 border-b border-slate-100 transition-colors">
 <div className="flex items-start justify-between gap-3 mb-4">
 {/* Consistent Theme Icon Box */}
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 shadow-inner ring-1 ring-inset ring-indigo-500/10 ">
 <Icon className="h-6 w-6" />
 </div>

  {/* Category Pill and Badges */}
  <div className="flex gap-2 items-center">
  {policy.aiScore && (
      <span className="shrink-0 rounded-full border border-primary-200 bg-primary-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-primary-600 flex gap-1 items-center">
      AI Match: {policy.aiScore}%
      </span>
  )}
  {policy.isBestValue && (
      <span className="shrink-0 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600">
      Best Value
      </span>
  )}
  <span className="shrink-0 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-600 ">
  {toTitleCase(policy.category)}
  </span>
  </div>
  </div>

  {/* Title & Company */}
  <div className="min-h-[60px]">
  <h3 className="text-lg font-bold text-slate-900 line-clamp-2 leading-tight">
  {policy.name}
  </h3>
  <p className="mt-1 text-sm font-medium text-slate-500 truncate">
  {policy.company}
  </p>
  </div>
  </div>

 {/* ─── BODY ─── */}
 <div className="flex flex-1 flex-col p-5 pt-4">
 {/* Description line-clamp, guaranteed height via line-clamp-2 usually handles 2 lines */}
 <p className="line-clamp-2 text-sm text-slate-600 mb-4 h-10 leading-relaxed">
 {policy.description}
 </p>

 {/* Key Benefits */}
 {policy.benefits && policy.benefits.length > 0 && (
 <ul className="mb-5 space-y-2">
 {policy.benefits.slice(0, 2).map((b) => (
 <li
 key={b}
 className="flex items-start gap-2 text-xs text-slate-600 "
 >
 <div className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
 <span className="line-clamp-1 leading-relaxed">{b}</span>
 </li>
 ))}
 </ul>
 )}

 {/* Add-ons UI */}
 {availableAddons.length > 0 && (
 <div className="mt-auto pt-4 border-t border-slate-100 ">
 <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-slate-500 ">
 <ShieldPlus className="h-3.5 w-3.5" />
 <span>Popular Add-ons</span>
 </div>
 <div className="flex flex-wrap gap-2">
 {availableAddons.map((addon) => {
 const isSelected = selectedAddons.has(addon.id);
 return (
 <button
 key={addon.id}
 onClick={(e) => toggleAddon(e, addon.id)}
 className={`group/btn flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold transition-all ${
 isSelected
 ? "border-indigo-500 bg-indigo-50 text-indigo-700 "
 : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 "
 }`}
 >
 <div
 className={`flex h-3 w-3 items-center justify-center rounded-[3px] border transition-colors ${
 isSelected
 ? "border-transparent bg-indigo-500"
 : "border-slate-300 group-hover/btn:border-slate-400"
 }`}
 >
 {isSelected && (
 <svg className="h-2 w-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
 </svg>
 )}
 </div>
 <span>{addon.label}</span>
 </button>
 );
 })}
 </div>
 </div>
 )}
 </div>

 {/* ─── FOOTER ─── */}
 <div className="grid grid-cols-3 divide-x divide-slate-100 bg-slate-50/50 border-y border-slate-100 ">
 <div className="px-2 py-3 text-center transition-colors hover:bg-slate-100/50 ">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ">Premium</p>
 <p className="mt-0.5 text-sm font-bold text-indigo-600 ">
 {formatCurrency(totalPremium)}
 </p>
 </div>
 <div className="px-2 py-3 text-center transition-colors hover:bg-slate-100/50 ">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ">Coverage</p>
 <p className="mt-0.5 text-sm font-bold text-slate-900 truncate">
 {formatCurrency(policy.coverage)}
 </p>
 </div>
 <div className="px-2 py-3 text-center transition-colors hover:bg-slate-100/50 ">
 <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 ">Rating</p>
 <div className="mt-0.5 flex items-center justify-center gap-1 text-sm font-bold text-slate-900 ">
 <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />
 {rating}
 </div>
 </div>
 </div>

 {/* ─── CTA ─── */}
 <div className="p-4 bg-slate-50/20 ">
 <Link
 to={`/policies/${policy.id}`}
 className="group/cta flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-600 hover:shadow-md "
 >
 View Details
 <ArrowRight className="h-4 w-4 transition-transform group-hover/cta:translate-x-1" />
 </Link>
 </div>
 </motion.article>
 );
});

export default PolicyCard;
