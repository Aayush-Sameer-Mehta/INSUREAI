 import { useCallback, useEffect, useState } from "react";
import { Download, Filter, IndianRupee, PieChart, Users, Star, TrendingUp, X, BarChart3 } from "lucide-react";
import { Cell, Legend, Pie, PieChart as RePieChart, ResponsiveContainer, Tooltip } from "recharts";
import { motion, AnimatePresence } from "framer-motion";
import { getAdminPremiumAnalytics, exportAdminPremiumAnalytics } from "../../services/adminService";
import { toast } from "react-hot-toast";
import { CATEGORY_LABELS } from "../../utils/categoryConfig";

const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtCurrency = (n) => `₹${fmt(n)}`;

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
 hidden: { opacity: 0, y: 16 },
 visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

const CustomTooltip = ({ active, payload, label }) => {
 if (!active || !payload?.length) return null;
 return (
 <div className="rounded-xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm ">
 <p className="text-xs font-semibold text-slate-500 ">{label}</p>
 {payload.map((entry, idx) => (
 <p key={idx} className="mt-1 text-sm font-bold" style={{ color: entry.color }}>
 {entry.name}: {entry.value}
 </p>
 ))}
 </div>
 );
};

export default function AdminPremiumAnalytics() {
 const [data, setData] = useState(null);
 const [loading, setLoading] = useState(true);
 const [filters, setFilters] = useState({
 startDate: "",
 endDate: "",
 category: "",
 paymentStatus: ""
 });
 const [showFilters, setShowFilters] = useState(false);

 const fetchData = useCallback(async () => {
 try {
 setLoading(true);
 const res = await getAdminPremiumAnalytics(filters);
 setData(res);
 } catch {
 toast.error("Failed to fetch premium analytics");
 } finally {
 setLoading(false);
 }
 }, [filters]);

 useEffect(() => {
 fetchData();
 }, [fetchData]);

 const handleExport = async () => {
 try {
 const blob = await exportAdminPremiumAnalytics(filters);
 const url = window.URL.createObjectURL(new Blob([blob]));
 const link = document.createElement("a");
 link.href = url;
 link.setAttribute("download", "premium_purchases.csv");
 document.body.appendChild(link);
 link.click();
 link.parentNode.removeChild(link);
 window.URL.revokeObjectURL(url);
 toast.success("Export downloaded successfully");
 } catch {
 toast.error("Export failed");
 }
 };

 if (loading && !data) {
 return (
 <div className="space-y-8 animate-fade-in">
 <div className="flex items-center justify-between">
 <div><div className="skeleton-title" /><div className="skeleton-text mt-2 w-48" /></div>
 <div className="flex gap-2"><div className="skeleton h-10 w-24 rounded-xl" /><div className="skeleton h-10 w-28 rounded-xl" /></div>
 </div>
 <div className="grid gap-4 sm:grid-cols-3">
 {[...Array(3)].map((_, i) => <div key={i} className="skeleton-card h-28" />)}
 </div>
 <div className="grid gap-6 lg:grid-cols-2">
 <div className="skeleton-card h-72" />
 <div className="skeleton-card h-72" />
 </div>
 </div>
 );
 }

 const statCards = [
 {
 label: "Total Premium Users",
 value: fmt(data?.totalPremiumUsers || 0),
 icon: Users,
 gradient: "from-primary-500 to-primary-700",
 bg: "bg-primary-50 ",
 iconColor: "text-primary-600 ",
 },
 {
 label: "Total Premium Revenue",
 value: fmtCurrency(data?.totalPremiumRevenue || 0),
 icon: IndianRupee,
 gradient: "from-emerald-500 to-teal-600",
 bg: "bg-emerald-50 ",
 iconColor: "text-emerald-600 ",
 },
 {
 label: "Completed Payments",
 value: fmt(data?.completedPaymentUsers || 0),
 icon: PieChart,
 gradient: "from-violet-500 to-purple-600",
 bg: "bg-violet-50 ",
 iconColor: "text-violet-600 ",
 },
 ];

 const pieData = Object.entries(data?.policyWiseCount || {}).map(([key, val]) => ({
 name: CATEGORY_LABELS[key] || key,
 value: val,
 rawKey: key
 }));

 const COLORS = ["#2563eb", "#0ea5a4", "#8b5cf6", "#f43f5e", "#f59e0b", "#06b6d4"];

 return (
 <motion.div
 initial="visible"
 animate="visible"
 variants={containerVariants}
 className="space-y-8"
 >
 {/* Header */}
 <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="section-title flex items-center gap-2">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-inner">
 <BarChart3 className="h-5 w-5 text-white" />
 </div>
 Premium Analytics
 </h1>
 <p className="section-subtitle mt-1">
 Insights on premium policy sales and revenue
 </p>
 </div>
 <div className="flex gap-2">
 <button
 onClick={() => setShowFilters(!showFilters)}
 className="btn-ghost !px-4 !py-2"
 >
 <Filter className="h-4 w-4" />
 Filters
 </button>
 <button onClick={handleExport} className="btn-primary !px-4 !py-2">
 <Download className="h-4 w-4" />
 Export CSV
 </button>
 </div>
 </motion.div>

 {/* Filters Panel */}
 <AnimatePresence>
 {showFilters && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: "auto" }}
 exit={{ opacity: 0, height: 0 }}
 className="panel relative overflow-hidden"
 >
 <div className="p-5">
 <button
 onClick={() => setShowFilters(false)}
 className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 "
 >
 <X className="h-4 w-4" />
 </button>
 <h3 className="text-sm font-bold text-slate-900 mb-4">Filter Analytics</h3>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1.5">Start Date</label>
 <input
 type="date"
 value={filters.startDate}
 onChange={(e) => setFilters(f => ({ ...f, startDate: e.target.value }))}
 className="field !py-2"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1.5">End Date</label>
 <input
 type="date"
 value={filters.endDate}
 onChange={(e) => setFilters(f => ({ ...f, endDate: e.target.value }))}
 className="field !py-2"
 />
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1.5">Policy Category</label>
 <select
 value={filters.category}
 onChange={(e) => setFilters(f => ({ ...f, category: e.target.value }))}
 className="field !py-2"
 >
 <option value="">All</option>
 {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
 <option key={k} value={k}>{v}</option>
 ))}
 </select>
 </div>
 <div>
 <label className="block text-xs font-medium text-slate-700 mb-1.5">Payment Status</label>
 <select
 value={filters.paymentStatus}
 onChange={(e) => setFilters(f => ({ ...f, paymentStatus: e.target.value }))}
 className="field !py-2"
 >
 <option value="">All</option>
 <option value="Paid">Paid</option>
 <option value="Pending">Pending</option>
 <option value="Failed">Failed</option>
 </select>
 </div>
 </div>
 <div className="mt-4 flex justify-end">
 <button
 onClick={() => setFilters({ startDate: "", endDate: "", category: "", paymentStatus: "" })}
 className="text-sm text-primary-600 hover:text-primary-700 font-medium transition"
 >
 Clear Filters
 </button>
 </div>
 </div>
 </motion.div>
 )}
 </AnimatePresence>

 {/* Stat Cards */}
 <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
 {statCards.map((card) => (
 <motion.div
 key={card.label}
 variants={itemVariants}
 whileHover={{ y: -4, transition: { duration: 0.2 } }}
 className="stat-card group"
 >
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 ">
 {card.label}
 </p>
 <p className={`mt-2 text-2xl font-bold ${card.iconColor}`}>
 {card.value}
 </p>
 </div>
 <div className={`rounded-xl ${card.bg} p-3 transition-all duration-300 group-hover:scale-110`}>
 <card.icon className={`h-5 w-5 ${card.iconColor}`} />
 </div>
 </div>
 <div className={`absolute bottom-0 left-0 h-1 w-full rounded-b-2xl bg-gradient-to-r ${card.gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-100`} />
 </motion.div>
 ))}
 </motion.div>

 <motion.div variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
 {/* Chart: Policy Wise Premium Users */}
 <div className="panel flex flex-col p-6">
 <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900 ">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 ">
 <PieChart className="h-4 w-4 text-primary-500" />
 </div>
 Policy-wise Premium Users
 </h2>
 <div className="h-64 w-full">
 {pieData.length > 0 ? (
 <ResponsiveContainer width="100%" height="100%">
 <RePieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 innerRadius={60}
 outerRadius={90}
 paddingAngle={4}
 dataKey="value"
 animationDuration={1200}
 animationEasing="ease-out"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip content={<CustomTooltip />} />
 <Legend
 verticalAlign="bottom"
 iconType="circle"
 iconSize={8}
 formatter={(value) => <span className="text-xs text-slate-600 ml-1">{value}</span>}
 />
 </RePieChart>
 </ResponsiveContainer>
 ) : (
 <div className="flex h-full flex-col items-center justify-center text-center">
 <PieChart className="mb-2 h-8 w-8 text-slate-300 " />
 <p className="text-sm text-slate-400">No data available</p>
 </div>
 )}
 </div>
 </div>

 {/* Top Selling Premium Policies */}
 <div className="panel flex flex-col p-6">
 <h2 className="mb-5 flex items-center gap-2 text-base font-bold text-slate-900 ">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 ">
 <TrendingUp className="h-4 w-4 text-secondary-500" />
 </div>
 Top Selling Premium Policies
 </h2>
 {data?.topSellingPolicies?.length > 0 ? (
 <div className="space-y-3">
 {data.topSellingPolicies.map((p, i) => (
 <motion.div
 key={p.policyId}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: i * 0.1 }}
 className="group flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 transition-all duration-200 hover:border-primary-200 hover:shadow-sm hover:bg-primary-50/30 "
 >
 <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-xs font-bold text-white shadow-md shadow-primary-500/20">
 #{i + 1}
 </span>
 <div className="min-w-0 flex-1">
 <p className="truncate text-sm font-semibold text-slate-900 ">{p.name}</p>
 <p className="truncate text-xs text-slate-500 ">
 {p.company} · {p.category}
 </p>
 </div>
 <div className="flex flex-col items-end gap-1 text-xs">
 <span className="font-semibold text-slate-700 ">{p.count} sold</span>
 <span className="text-emerald-600 ">{fmtCurrency(p.revenue)}</span>
 </div>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="flex h-48 flex-col items-center justify-center text-center">
 <TrendingUp className="mb-2 h-8 w-8 text-slate-300 " />
 <p className="text-sm text-slate-400">No top sellers available</p>
 </div>
 )}
 </div>
 </motion.div>

 {/* Recently Purchased Details Table */}
 <motion.div variants={itemVariants} className="panel-soft overflow-hidden p-0 relative">
 <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
 <div className="relative border-b border-slate-100 px-6 py-4 ">
 <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 ">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 ">
 <Star className="h-4 w-4 text-accent-500" />
 </div>
 Recently Purchased Premium Policies
 </h2>
 </div>
 <div className="relative overflow-x-auto">
 <table className="data-table">
 <thead>
 <tr>
 <th>Policy</th>
 <th>Category</th>
 <th>Amount</th>
 <th>Status</th>
 <th>Date</th>
 </tr>
 </thead>
 <tbody>
 {data?.recentlyPurchased?.length > 0 ? (
 data.recentlyPurchased.map((purchase) => (
 <tr key={purchase._id}>
 <td>
 <div className="font-medium text-slate-900 ">{purchase.policyName}</div>
 <div className="text-xs text-slate-500">{purchase.company}</div>
 </td>
 <td>
 <span className="badge-info">
 {CATEGORY_LABELS[purchase.category] || purchase.category}
 </span>
 </td>
 <td className="font-semibold text-slate-900 ">
 {fmtCurrency(purchase.amount)}
 </td>
 <td>
 <span className={`badge ${purchase.paymentStatus === 'Paid'
 ? 'badge-success'
 : purchase.paymentStatus === 'Failed'
 ? 'badge-danger'
 : 'badge-warning'
 }`}>
 {purchase.paymentStatus || 'Paid'}
 </span>
 </td>
 <td className="text-slate-500 ">
 {new Date(purchase.purchasedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
 </td>
 </tr>
 ))
 ) : (
 <tr>
 <td colSpan={5} className="!py-12 text-center">
 <Star className="mx-auto mb-3 h-8 w-8 text-slate-300 " />
 <p className="text-sm text-slate-400 ">No recent purchases found.</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </motion.div>
 </motion.div>
 );
}
