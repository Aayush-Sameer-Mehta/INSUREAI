import { useEffect, useState } from "react";
import {
 Users,
 Shield,
 FileWarning,
 CheckCircle2,
 Clock,
 IndianRupee,
 TrendingUp,
 AlertTriangle,
 ShieldAlert,
 ArrowUpRight,
 ArrowDownRight,
 Activity,
 Sparkles,
 Bell,
 CreditCard,
 UserPlus,
 CalendarClock,
 PieChart as PieChartIcon,
} from "lucide-react";
import { motion } from "framer-motion";
import {
 AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
 ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar,
 Legend,
} from "recharts";
import { getAdminAnalyticsV2, getAdminDashboard } from "../../services/adminService";

const fmt = (n) => new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
const fmtCurrency = (n) => `₹${fmt(n)}`;
const formatMonthLabel = (value) => {
 const str = String(value || "");
 const match = str.match(/^(\d{4})-(\d{2})$/);
 if (!match) return str || "NA";

 const year = Number(match[1]);
 const monthIndex = Number(match[2]) - 1;
 const date = new Date(year, monthIndex, 1);
 return date.toLocaleDateString("en-IN", { month: "short", year: "2-digit" });
};
const formatCategoryLabel = (value) =>
 String(value || "Unknown")
 .replace(/_/g, " ")
 .replace(/\b\w/g, (char) => char.toUpperCase());

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
};
const itemVariants = {
 hidden: { opacity: 0, y: 20 },
 visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 280, damping: 26 } },
};

const CHART_COLORS = ["#2563eb", "#0ea5a4", "#f59e0b", "#8b5cf6", "#ef4444", "#10b981"];

const SkeletonCard = () => (
 <div className="stat-card">
 <div className="flex items-start justify-between">
 <div className="space-y-3 flex-1">
 <div className="skeleton h-3 w-20" />
 <div className="skeleton h-7 w-28" />
 <div className="skeleton h-3 w-16" />
 </div>
 <div className="skeleton-circle" />
 </div>
 </div>
);

const TrendBadge = ({ value, suffix = "%" }) => {
 const isPositive = value >= 0;
 return (
 <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${
 isPositive
 ? "bg-emerald-50 text-emerald-700 ring-emerald-200/50 "
 : "bg-red-50 text-red-700 ring-red-200/50 "
 }`}>
 {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
 {Math.abs(value)}{suffix}
 </span>
 );
};

const CustomTooltip = ({ active, payload, label }) => {
 if (!active || !payload?.length) return null;
 return (
 <div className="rounded-xl border border-slate-200/80 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-sm ">
 <p className="text-xs font-semibold text-slate-500 ">{label}</p>
 {payload.map((entry, idx) => (
 <p key={idx} className="mt-1 text-sm font-bold" style={{ color: entry.color }}>
 {entry.name}: {typeof entry.value === "number" && entry.name?.includes("Revenue")
 ? fmtCurrency(entry.value)
 : fmt(entry.value)}
 </p>
 ))}
 </div>
 );
};

export default function AdminDashboard() {
 const [data, setData] = useState(null);
 const [analyticsV2, setAnalyticsV2] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 Promise.all([
 getAdminDashboard().catch(() => null),
 getAdminAnalyticsV2().catch(() => null),
 ]).then(([dashData, analytics]) => {
 setData(dashData);
 setAnalyticsV2(analytics);
 }).finally(() => setLoading(false));
 }, []);

 if (loading) {
 return (
 <div className="space-y-8 animate-fade-in">
 <div><div className="skeleton-title mb-2" /><div className="skeleton-text w-48" /></div>
 <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
 </div>
 <div className="grid gap-6 lg:grid-cols-2">
 <div className="skeleton-card h-72" />
 <div className="skeleton-card h-72" />
 </div>
 </div>
 );
 }

 if (!data) {
 return (
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center ">
 <AlertTriangle className="mx-auto mb-3 h-8 w-8 text-red-500" />
 <h3 className="text-lg font-bold text-red-700 ">Failed to load dashboard</h3>
 <p className="mt-1 text-sm text-red-600 ">Please try refreshing the page</p>
 </motion.div>
 );
 }

 const statCards = [
 {
 label: "Total Users", value: fmt(data.totalUsers), icon: Users, trend: 8.3,
 gradient: "from-secondary-500 to-secondary-700", bg: "bg-secondary-50 ",
 iconColor: "text-secondary-600 ",
 },
 {
 label: "Active Policies", value: fmt(data.totalPoliciesSold), icon: Shield, trend: 12.5,
 gradient: "from-primary-500 to-primary-700", bg: "bg-primary-50 ",
 iconColor: "text-primary-600 ",
 },
 {
 label: "Pending Claims", value: fmt((data.claims?.submittedClaims || 0) + (data.claims?.underReviewClaims || 0)),
 icon: Clock, trend: -3.2,
 gradient: "from-accent-500 to-accent-700", bg: "bg-accent-50 ",
 iconColor: "text-accent-600 ",
 },
 {
 label: "Total Revenue", value: fmtCurrency(data.revenueSummary?.totalRevenue || 0),
 icon: IndianRupee, trend: 22.1,
 gradient: "from-violet-500 to-violet-700", bg: "bg-violet-50 ",
 iconColor: "text-violet-600 ",
 },
 {
 label: "Approved Claims", value: fmt(data.claims?.approvedClaims || 0),
 icon: CheckCircle2, trend: 15.7,
 gradient: "from-emerald-500 to-emerald-700", bg: "bg-emerald-50 ",
 iconColor: "text-emerald-600 ",
 },
 {
 label: "Fraud Alerts", value: fmt(analyticsV2?.kpis?.fraudAlerts || 0),
 icon: ShieldAlert, trend: -5.0,
 gradient: "from-red-500 to-red-700", bg: "bg-red-50 ",
 iconColor: "text-red-600 ",
 },
 ];

 const revenueChart = analyticsV2?.charts?.revenueTrends || analyticsV2?.charts?.revenueGrowth;
 const policyDistributionChart =
 analyticsV2?.charts?.policyPopularity || analyticsV2?.charts?.policyDistribution;
 const monthlyClaimsChart = analyticsV2?.charts?.monthlyClaims;

 const revenueData = revenueChart
 ? Object.entries(revenueChart)
 .sort(([a], [b]) => String(a).localeCompare(String(b)))
 .map(([month, revenue]) => ({
 month: formatMonthLabel(month),
 revenue: Number(revenue || 0),
 }))
 : [{ month: "Jan", revenue: 120000 }, { month: "Feb", revenue: 150000 }, { month: "Mar", revenue: 180000 }, { month: "Apr", revenue: 220000 }, { month: "May", revenue: 195000 }, { month: "Jun", revenue: 280000 }];

 const policyDistData = policyDistributionChart
 ? Object.entries(policyDistributionChart).map(([name, value]) => ({
 name: formatCategoryLabel(name),
 value: Number(value || 0),
 }))
 : [{ name: "Health", value: 35 }, { name: "Vehicle", value: 25 }, { name: "Life", value: 20 }, { name: "Travel", value: 12 }, { name: "Home", value: 8 }];

 const monthlyClaimsData = monthlyClaimsChart
 ? Object.entries(monthlyClaimsChart)
 .sort(([a], [b]) => String(a).localeCompare(String(b)))
 .map(([month, count]) => ({
 month: formatMonthLabel(month),
 claims: Number(count || 0),
 }))
 : [{ month: "Jan", claims: 30 }, { month: "Feb", claims: 45 }, { month: "Mar", claims: 38 }, { month: "Apr", claims: 52 }, { month: "May", claims: 41 }, { month: "Jun", claims: 58 }];

 const claimsBreakdown = [
 { label: "Submitted", value: data.claims?.submittedClaims || 0, color: "bg-primary-500" },
 { label: "Under Review", value: data.claims?.underReviewClaims || 0, color: "bg-accent-500" },
 { label: "Approved", value: data.claims?.approvedClaims || 0, color: "bg-emerald-500" },
 { label: "Rejected", value: data.claims?.rejectedClaims || 0, color: "bg-red-500" },
 ];

 const alerts = [];
 if ((data.claims?.submittedClaims || 0) > 0) {
 alerts.push({ icon: Clock, text: `${data.claims.submittedClaims} pending claim approvals`, color: "text-amber-600 ", bg: "bg-amber-50 " });
 }
 if ((analyticsV2?.kpis?.fraudAlerts || 0) > 0) {
 alerts.push({ icon: ShieldAlert, text: `${analyticsV2.kpis.fraudAlerts} fraud alerts detected`, color: "text-red-600 ", bg: "bg-red-50 " });
 }
 if ((data.blockedUsers || 0) > 0) {
 alerts.push({ icon: Users, text: `${data.blockedUsers} blocked user accounts`, color: "text-slate-600 ", bg: "bg-slate-50 " });
 }

 const recentActivity = [
 { icon: FileWarning, text: "New claim submitted by user", time: "2 min ago", color: "text-amber-500", bg: "bg-amber-50 " },
 { icon: CreditCard, text: "Premium payment received", time: "15 min ago", color: "text-emerald-500", bg: "bg-emerald-50 " },
 { icon: UserPlus, text: "New user registered", time: "1 hour ago", color: "text-primary-500", bg: "bg-primary-50 " },
 { icon: CheckCircle2, text: "Claim approved by admin", time: "2 hours ago", color: "text-emerald-500", bg: "bg-emerald-50 " },
 { icon: CalendarClock, text: "Policy renewal processed", time: "3 hours ago", color: "text-violet-500", bg: "bg-violet-50 " },
 ];

 return (
 <motion.div initial="visible" animate="visible" variants={containerVariants} className="space-y-6">
 <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-primary-950 to-slate-900 p-6 text-white shadow-2xl">
 <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-primary-500/10 blur-2xl" />
 <div className="absolute -bottom-8 -left-8 h-32 w-32 rounded-full bg-secondary-500/10 blur-2xl" />
 <div className="absolute right-20 top-4 h-20 w-20 rounded-full bg-accent-500/5 blur-xl" />
 <div className="relative z-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
 <div>
 <div className="mb-2 flex items-center gap-2.5">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm shadow-inner">
 <Sparkles className="h-5 w-5 text-accent-400" />
 </div>
 <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
 </div>
 <p className="text-sm text-slate-300/90">Welcome back! Here&apos;s your InsureAI platform overview</p>
 </div>
 <div className="flex items-center gap-3">
 <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 text-xs font-semibold backdrop-blur-sm">
 <span className="live-dot" />
 System Online
 </span>
 </div>
 </div>
 </motion.div>

 <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
 {statCards.map((card, i) => (
 <motion.div key={i} whileHover={{ y: -4 }} className="stat-card group">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 ">
 {card.label}
 </p>
 <h3 className={`mt-1.5 text-2xl font-black ${card.iconColor}`}>{card.value}</h3>
 </div>
 <div className={`flex h-12 w-12 items-center justify-center rounded-2xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3 ${card.bg}`}>
 <card.icon className={`h-6 w-6 ${card.iconColor}`} />
 </div>
 </div>
 <div className="mt-4 flex items-center justify-between">
 <TrendBadge value={card.trend} />
 <span className="text-[10px] font-medium text-slate-400">vs last month</span>
 </div>
 <div className={`absolute bottom-0 left-0 h-1 w-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-gradient-to-r ${card.gradient}`} />
 </motion.div>
 ))}
 </motion.div>

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 <motion.div variants={itemVariants} className="panel lg:col-span-2 flex flex-col p-5">
 <div className="mb-4 flex items-center justify-between">
 <h2 className="flex items-center gap-2 text-base font-bold text-slate-900 ">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-50 ">
 <TrendingUp className="h-4 w-4 text-primary-500" />
 </div>
 Revenue Growth
 </h2>
 <select className="glass-input !py-1 !text-xs !w-auto">
 <option>Last 6 Months</option>
 <option>This Year</option>
 </select>
 </div>
 <div className="h-72 w-full flex-1">
 <ResponsiveContainer width="100%" height="100%">
 <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
 <defs>
 <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
 <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
 <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
 </linearGradient>
 </defs>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `₹${val / 1000}k`} />
 <Tooltip content={<CustomTooltip />} />
 <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
 </AreaChart>
 </ResponsiveContainer>
 </div>
 </motion.div>

 <motion.div variants={itemVariants} className="panel flex flex-col p-5">
 <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 ">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary-50 ">
 <PieChartIcon className="h-4 w-4 text-secondary-500" />
 </div>
 Policy Distribution
 </h2>
 <div className="flex-1 min-h-[250px]">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie data={policyDistData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value" animationDuration={1000}>
 {policyDistData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip content={<CustomTooltip />} />
 <Legend verticalAlign="bottom" iconType="circle" iconSize={8} formatter={(val) => <span className="text-xs font-medium text-slate-600 ml-1">{val}</span>} />
 </PieChart>
 </ResponsiveContainer>
 </div>
 </motion.div>
 </div>

 <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
 <motion.div variants={itemVariants} className="panel lg:col-span-2 p-5">
 <h2 className="mb-6 flex items-center gap-2 text-base font-bold text-slate-900 ">
 <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-50 ">
 <Activity className="h-4 w-4 text-accent-500" />
 </div>
 Claims Analytics
 </h2>
 
 <div className="grid sm:grid-cols-2 gap-8">
 <div className="space-y-4">
 {claimsBreakdown.map((item, i) => (
 <div key={i}>
 <div className="flex justify-between text-sm mb-1.5">
 <span className="font-medium text-slate-600 ">{item.label}</span>
 <span className="font-bold text-slate-900 ">{item.value}</span>
 </div>
 <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
 <motion.div 
 initial={{ width: 0 }} 
 animate={{ width: `${Math.min(100, Math.max(5, (item.value / ((data.claims?.totalClaims) || 1)) * 100))}%` }} 
 transition={{ duration: 1, delay: 0.2 }}
 className={`h-full rounded-full ${item.color}`} 
 />
 </div>
 </div>
 ))}
 </div>
 
 <div className="h-48">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={monthlyClaimsData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
 <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} dy={5} />
 <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b' }} />
 <Tooltip cursor={{ fill: 'transparent' }} content={<CustomTooltip />} />
 <Bar dataKey="claims" name="Claims" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={30} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>
 </motion.div>

 <div className="space-y-6 lg:col-span-1">
 <motion.div variants={itemVariants} className="panel p-5">
 <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 ">
 <Bell className="h-4 w-4 text-slate-400" /> Action Required
 </h2>
 {alerts.length > 0 ? (
 <div className="space-y-2.5">
 {alerts.map((alert, i) => (
 <motion.div key={i} whileHover={{ x: 3 }} className={`flex items-start gap-3 rounded-xl p-3 ${alert.bg}`}>
 <alert.icon className={`h-4 w-4 shrink-0 mt-0.5 ${alert.color}`} />
 <p className={`text-sm font-semibold ${alert.color}`}>{alert.text}</p>
 </motion.div>
 ))}
 </div>
 ) : (
 <div className="flex flex-col items-center py-6 text-center">
 <CheckCircle2 className="mb-2 h-8 w-8 text-emerald-400 opacity-50" />
 <p className="text-sm text-slate-500">All caught up!</p>
 </div>
 )}
 </motion.div>

 <motion.div variants={itemVariants} className="panel p-5 flex-1">
 <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-slate-900 ">
 <Clock className="h-4 w-4 text-slate-400" /> Recent Activity
 </h2>
 <div className="relative pl-2">
 <div className="absolute left-4 top-2 h-full w-px bg-slate-200 " />
 <div className="space-y-4">
 {recentActivity.map((act, i) => (
 <div key={i} className="relative flex gap-3">
 <div className={`relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ring-4 ring-white ${act.bg}`}>
 <act.icon className={`h-2.5 w-2.5 ${act.color}`} />
 </div>
 <div>
 <p className="text-sm font-medium text-slate-700 ">{act.text}</p>
 <p className="text-xs text-slate-500">{act.time}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </motion.div>
 </div>
 </div>
 </motion.div>
 );
}
