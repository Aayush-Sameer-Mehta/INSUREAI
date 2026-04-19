import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
 ArrowRight,
 CheckCircle2,
 XCircle,
 Search,
 SlidersHorizontal,
 GitCompareArrows,
 Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Loader from "../../components/Loader";
import { fetchPolicies } from "../../services/policyService";
import { formatCurrency, toTitleCase } from "../../utils/formatters";
import { CATEGORY_ICONS, CATEGORY_GRADIENTS } from "../../utils/categoryConfig";

/* ─── category helpers ───────────────────────────────── */
const ICONS = CATEGORY_ICONS;
const GRADIENTS = CATEGORY_GRADIENTS;

/* ─── comparison rows config ─────────────────────────── */
const ROWS = [
 { label: "Company", fn: (p) => p.company, highlight: false },
 { label: "Category", fn: (p) => toTitleCase(p.category), highlight: false },
 { label: "Premium", fn: (p) => formatCurrency(p.price), highlight: true, best: "min", key: "price" },
 { label: "Coverage", fn: (p) => formatCurrency(p.coverage), highlight: true, best: "max", key: "coverage" },
 { label: "Rating", fn: (p) => Number(p.ratingAverage || 0).toFixed(1), highlight: true, best: "max", key: "ratingAverage" },
 { label: "Claim Settlement Ratio", fn: (p) => `${Number(p.claimSettlementRatio || 0).toFixed(1)}%`, highlight: true, best: "max", key: "claimSettlementRatio" },
 { label: "Waiting Period", fn: (p) => `${Number(p.waitingPeriodDays || 0)} days`, highlight: true, best: "min", key: "waitingPeriodDays" },
 { label: "Network Hospitals/Garages", fn: (p) => `${p.networkCount || 0}`, highlight: true, best: "max", key: "networkCount" },
 { label: "Reviews", fn: (p) => `${p.reviewsCount || 0} reviews`, highlight: false },
];

/* ─── animation variants ─────────────────────────────── */


/* ═══════════════════════════════════════════════════════ */
export default function ComparePolicies() {
 const [policies, setPolicies] = useState([]);
 const [selected, setSelected] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [catFilter, setCatFilter] = useState("");

 useEffect(() => {
 const load = async () => {
 setLoading(true);
 try { setPolicies(await fetchPolicies()); }
 finally { setLoading(false); }
 };
 load();
 }, []);

 const togglePolicy = (id) => {
 setSelected((prev) => {
 if (prev.includes(id)) return prev.filter((i) => i !== id);
 if (prev.length >= 4) return prev;
 return [...prev, id];
 });
 };

 const removePolicy = (id) => setSelected((prev) => prev.filter((i) => i !== id));

 const compared = policies.filter((p) => selected.includes(p.id));

 const filtered = policies.filter((p) => {
 const q = search.toLowerCase();
 const matchSearch = !q || p.name.toLowerCase().includes(q) || p.company.toLowerCase().includes(q);
 const matchCat = !catFilter || p.category === catFilter;
 return matchSearch && matchCat;
 });

 const categories = [...new Set(policies.map((p) => p.category))];

 /* find best value for highlighted rows */
 const getBest = (row) => {
 if (!row.highlight || !row.key || compared.length < 2) return null;
 const vals = compared.map((p) => Number(p[row.key] || 0));
 return row.best === "min" ? Math.min(...vals) : Math.max(...vals);
 };

 if (loading) return <Loader />;

 return (
 <motion.div
 initial={{ opacity: 0, y: 15 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="page-shell max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
 >
 {/* ─── HEADER ───────────────────────────────────── */}
 <motion.div
 initial={{ opacity: 0, x: -20 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ duration: 0.6, delay: 0.1 }}
 >
 <div className="flex items-center gap-3">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-lg shadow-indigo-500/20">
 <GitCompareArrows className="h-6 w-6" />
 </div>
 <div>
 <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
 Compare Policies
 </h1>
 <p className="text-sm text-slate-500 ">
 Select up to 4 policies for side-by-side comparison
 </p>
 </div>
 </div>
 </motion.div>

 {/* ─── SELECTED PILLS ───────────────────────────── */}
 <AnimatePresence>
 {selected.length > 0 && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="overflow-hidden"
 >
 <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-indigo-100 bg-indigo-50/50 p-4 mt-4">
 <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-indigo-500">
 Comparing ({selected.length}/4):
 </span>
 {compared.map((p) => {
 const Icon = ICONS[p.category] || Shield;
 return (
 <span
 key={p.id}
 className="group inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 "
 >
 <Icon className="h-3 w-3 text-indigo-500" />
 {p.name}
 <button
 type="button"
 onClick={() => removePolicy(p.id)}
 className="ml-0.5 rounded-full p-0.5 text-slate-400 transition hover:bg-red-50 hover:text-red-500 "
 >
 <XCircle className="h-3.5 w-3.5" />
 </button>
 </span>
 );
 })}
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* ─── FILTERS + POLICY SELECTOR ────────────────── */}
 <motion.section
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 transition={{ duration: 0.5, delay: 0.2 }}
 className="glass-panel mt-8"
 >
 {/* filter bar */}
 <div className="flex flex-col gap-3 border-b border-white/20 px-5 py-4 sm:flex-row sm:items-center">
 <div className="relative flex-1">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
 <input
 type="text"
 placeholder="Search policies..."
 value={search}
 onChange={(e) => setSearch(e.target.value)}
 className="field w-full !pl-10 appearance-none"
 />
 </div>
 <div className="relative">
 <SlidersHorizontal className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
 <select
 value={catFilter}
 onChange={(e) => setCatFilter(e.target.value)}
 className="field !pl-10 sm:w-44 appearance-none"
 >
 <option value="">All Categories</option>
 {categories.map((c) => (
 <option key={c} value={c}>{toTitleCase(c)}</option>
 ))}
 </select>
 </div>
 </div>

 {/* policy grid */}
 <motion.div
 variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
 initial="hidden"
 animate="visible"
 className="grid gap-2 p-4 sm:grid-cols-2 lg:grid-cols-3"
 >
 {filtered.map((policy) => {
 const isChecked = selected.includes(policy.id);
 const isDisabled = !isChecked && selected.length >= 4;
 const Icon = ICONS[policy.category] || Shield;
 const grad = GRADIENTS[policy.category] || "from-slate-500 to-slate-700";

 return (
 <label
 key={policy.id}
 className={`relative flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3.5 transition
 ${isChecked
 ? "border-indigo-500 bg-indigo-50/50 shadow-md shadow-indigo-500/10 "
 : "border-slate-200 bg-white hover:border-slate-300 "}
 ${isDisabled ? "cursor-not-allowed opacity-40" : ""}`}
 >
 {/* custom checkbox */}
 <div className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-2 transition
 ${isChecked
 ? "border-indigo-500 bg-indigo-500 "
 : "border-slate-300 "}`}
 >
 {isChecked && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
 </div>
 <input
 type="checkbox"
 checked={isChecked}
 disabled={isDisabled}
 onChange={() => togglePolicy(policy.id)}
 className="sr-only"
 />
 {/* icon */}
 <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${grad} text-white`}>
 <Icon className="h-4 w-4" />
 </div>
 {/* text */}
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-slate-900 ">{policy.name}</p>
 <p className="truncate text-xs text-slate-500 ">
 {policy.company} • {formatCurrency(policy.price)}/yr
 </p>
 </div>
 </label>
 );
 })}
 </motion.div>

 {filtered.length === 0 && (
 <div className="p-8 text-center text-sm text-slate-500">No policies match your search.</div>
 )}
 </motion.section>

 {/* ─── COMPARISON TABLE ──────────────────────────── */}
 <AnimatePresence mode="wait">
 {compared.length > 0 ? (
 <motion.section
 key="table"
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 exit={{ opacity: 0, y: -20 }}
 className="glass-panel overflow-hidden mt-8"
 >
 {/* table header */}
 <div className="flex items-center gap-3 border-b border-white/20 px-6 py-4 bg-white/50 ">
 <GitCompareArrows className="h-5 w-5 text-indigo-500" />
 <h2 className="text-lg font-semibold text-slate-900 ">Side-by-Side Comparison</h2>
 </div>

 <div className="overflow-x-auto">
 <table className="w-full min-w-[600px] text-sm">
 {/* policy name header */}
 <thead>
 <tr className="border-b border-slate-100 ">
 <th className="w-36 px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">
 Feature
 </th>
 {compared.map((policy) => {
 const Icon = ICONS[policy.category] || Shield;
 const grad = GRADIENTS[policy.category] || "from-slate-500 to-slate-700";
 return (
 <th key={policy.id} className="px-4 py-4 text-left">
 <div className="flex items-center gap-2.5">
 <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${grad} text-white`}>
 <Icon className="h-4 w-4" />
 </div>
 <div>
 <p className="font-semibold text-slate-900 ">{policy.name}</p>
 <p className="text-xs font-normal text-slate-500 ">{policy.company}</p>
 </div>
 </div>
 </th>
 );
 })}
 </tr>
 </thead>

 <tbody>
 {ROWS.map((row) => {
 const bestVal = getBest(row);
 return (
 <tr
 key={row.label}
 className="border-b border-slate-50 transition hover:bg-slate-50/50 "
 >
 <td className="px-6 py-3.5 font-medium text-slate-700 ">{row.label}</td>
 {compared.map((policy) => {
 const val = row.fn(policy);
 const numVal = row.key ? Number(policy[row.key] || 0) : null;
 const isBest = row.highlight && bestVal !== null && numVal === bestVal && compared.length >= 2;
 return (
 <td key={`${policy.id}-${row.label}`} className="px-4 py-3.5">
 <span className={`inline-flex items-center gap-1.5 ${isBest ? "font-bold text-emerald-600 " : "text-slate-600 "}`}>
 {isBest && <CheckCircle2 className="h-3.5 w-3.5" />}
 {val}
 </span>
 </td>
 );
 })}
 </tr>
 );
 })}

 {/* benefits row */}
 <tr
 className="border-b border-slate-50 "
 >
 <td className="px-6 py-3.5 align-top font-medium text-slate-700 ">
 Key Benefits
 </td>
 {compared.map((policy) => (
 <td key={`${policy.id}-benefits`} className="px-4 py-3.5 align-top">
 <ul className="space-y-1.5">
 {policy.benefits?.map((b, i) => (
 <li key={i} className="flex items-start gap-2 text-xs text-slate-600 ">
 <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0 text-indigo-400" />
 <span>{b}</span>
 </li>
 ))}
 </ul>
 </td>
 ))}
 </tr>

 {/* action row */}
 <tr>
 <td className="px-6 py-4" />
 {compared.map((policy) => (
 <td key={`${policy.id}-action`} className="px-4 py-4">
 <Link
 to={`/policies/${policy.id}`}
 className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700"
 >
 View Details <ArrowRight className="h-3 w-3" />
 </Link>
 </td>
 ))}
 </tr>
 </tbody>
 </table>
 </div>
 </motion.section>
 ) : (
 <motion.div
 key="empty"
 initial={{ opacity: 0, scale: 0.95 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.95 }}
 className="glass-panel border-dashed border-white/40 bg-slate-50/50 p-12 text-center mt-8"
 >
 <div
 className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 "
 >
 <GitCompareArrows className="h-8 w-8 text-indigo-500" />
 </div>
 <h3 className="text-lg font-semibold text-slate-700 ">
 No policies selected
 </h3>
 <p className="mt-1 text-sm text-slate-500">
 Select policies above to see a detailed comparison.
 </p>
 <Link
 to="/policies"
 className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition hover:gap-3 "
 >
 Browse all policies <ArrowRight className="h-4 w-4" />
 </Link>
 </motion.div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}
