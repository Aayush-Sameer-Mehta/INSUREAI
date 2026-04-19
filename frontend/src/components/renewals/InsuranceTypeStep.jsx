import { Car, Bike, HeartPulse, Shield, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";

const TYPE_META = {
 car: {
 icon: Car,
 accent: "from-sky-500 to-blue-700",
 tint: "bg-sky-50 text-sky-700 ",
 description: "Fast motor renewal with vehicle lookup and premium comparison.",
 },
 bike: {
 icon: Bike,
 accent: "from-emerald-500 to-teal-700",
 tint: "bg-emerald-50 text-emerald-700 ",
 description: "Two-wheeler renewal for active, expiring, or lapsed policies.",
 },
 health: {
 icon: HeartPulse,
 accent: "from-rose-500 to-pink-700",
 tint: "bg-rose-50 text-rose-700 ",
 description: "Continue medical protection without gaps in family coverage.",
 },
 life: {
 icon: Shield,
 accent: "from-violet-500 to-indigo-700",
 tint: "bg-violet-50 text-violet-700 ",
 description: "Review your plan before renewal and protect your long-term goals.",
 },
};

export default function InsuranceTypeStep({ options, value, onChange }) {
 return (
 <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 {options.map((option, index) => {
 const meta = TYPE_META[option.key] || TYPE_META.car;
 const Icon = meta.icon;
 const active = value === option.key;

 return (
 <motion.button
 key={option.key}
 type="button"
 onClick={() => onChange(option.key)}
 initial={{ opacity: 0, y: 14 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: index * 0.05 }}
 className={`group relative overflow-hidden rounded-[28px] border p-5 text-left transition-all ${
 active
 ? "border-primary-500 bg-white shadow-lg shadow-primary-500/10 "
 : "border-slate-200 bg-white hover:-translate-y-1 hover:border-slate-300 hover:shadow-md "
 }`}
 >
 <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${meta.accent}`} />
 <div className="flex items-start justify-between gap-4">
 <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${meta.tint}`}>
 <Icon className="h-6 w-6" />
 </div>
 {active && <CheckCircle2 className="h-5 w-5 text-primary-500 " />}
 </div>

 <div className="mt-5">
 <p className="text-lg font-bold text-slate-900 ">{option.label}</p>
 <p className="mt-2 text-sm leading-6 text-slate-500 ">{meta.description}</p>
 </div>
 </motion.button>
 );
 })}
 </div>
 );
}
