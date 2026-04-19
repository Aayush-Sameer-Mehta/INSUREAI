import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
 ArrowRight,
 BrainCircuit,
 Clock,
 CreditCard,
 Download,
 Eye,
 FileText,
 HeartHandshake,
 ShieldCheck,
 Sparkles,
 RefreshCw,
 Shield,
 IndianRupee,
 AlertTriangle,
 Zap,
 UserCircle2,
 Activity,
} from "lucide-react";
import { motion } from "framer-motion";
import Loader from "../../components/Loader";
import { StatsCard, Card, Badge } from "../../components/common";
import api from "../../services/api";
import { getMyClaims } from "../../services/claimService";
import { fetchNotifications, markNotificationRead } from "../../services/notificationService";
import { formatCurrency } from "../../utils/formatters";
import ExportButton from "../../components/ExportButton";

import RiskGauge from "./RiskGauge";
import ClaimsTracker from "./ClaimsTracker";
import PaymentHistory from "./PaymentHistory";
import NotificationsFeed from "./NotificationsFeed";
import DependentsList from "./DependentsList";
import ProfileCompletion from "./ProfileCompletion";

/* ─── Animation variants ──────────────────────────── */
const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
 hidden: { opacity: 0, y: 24 },
 visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 260, damping: 24 } },
};

export default function Dashboard() {
 const [profile, setProfile] = useState(null);
 const [claims, setClaims] = useState([]);
 const [notifications, setNotifications] = useState([]);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 const load = async () => {
 setLoading(true);
 try {
 const [profileRes, claimsRes, notifRes] = await Promise.allSettled([
 api.get("/users/profile"),
 getMyClaims(),
 fetchNotifications(),
 ]);
 if (profileRes.status === "fulfilled") setProfile(profileRes.value.data);
 if (claimsRes.status === "fulfilled") setClaims(claimsRes.value || []);
 if (notifRes.status === "fulfilled") setNotifications(notifRes.value || []);
 } finally {
 setLoading(false);
 }
 };
 load();
 }, []);

 if (loading) return <Loader label="Loading dashboard..." />;

 /* ─── Computed values ─────────────────────────────── */
 const purchasedPolicies = profile?.purchasedPolicies || [];
 const activePolicies = purchasedPolicies.length;
 const totalPremium = purchasedPolicies.reduce((sum, p) => sum + (p.amount || 0), 0);
 const pendingClaims = claims.filter((c) => c.status === "Submitted" || c.status === "Under Review").length;

 const renewalReminders = purchasedPolicies
 .filter((p) => p.validTo)
 .map((p) => {
 const daysLeft = Math.ceil((new Date(p.validTo) - new Date()) / (1000 * 60 * 60 * 24));
 return { ...p, daysLeft };
 })
 .filter((p) => p.daysLeft <= 60 && p.daysLeft > 0)
 .sort((a, b) => a.daysLeft - b.daysLeft);

 const nextPayment = renewalReminders[0];

 const avgRisk = claims.length > 0
 ? Math.round(claims.reduce((s, c) => s + (c.fraudRiskScore || 0), 0) / claims.length)
 : 12;
 const riskScore = Math.max(0, Math.min(100, 100 - avgRisk));
 const firstName = profile?.fullName?.split(" ")?.[0] || "there";
 const assignedAgent = profile?.user_profile?.assigned_agent_id;
 const completionChecks = [
 profile?.dateOfBirth,
 profile?.occupation,
 profile?.annualIncome,
 profile?.nomineeName,
 profile?.kycDetails?.isKycVerified,
 profile?.dependents?.length > 0,
 ];
 const completionPercent = Math.round(
 (completionChecks.filter(Boolean).length / completionChecks.length) * 100,
 );
 const openNotifications = notifications.filter((notif) => !notif.isRead).length;

 const downloadPolicyPdf = async (purchaseId) => {
 try {
 const response = await api.get(`/users/policy-document/${purchaseId}`, { responseType: "blob" });
 const blob = new Blob([response.data], { type: "application/pdf" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `policy-${purchaseId}.pdf`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 } catch { /* non-blocking */ }
 };

 const handleMarkRead = async (id) => {
 try {
 await markNotificationRead(id);
 setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
 } catch { /* non-blocking */ }
 };

 const stats = [
 { icon: ShieldCheck, label: "Active Policies", value: activePolicies, gradient: "from-primary-500 to-primary-700", bg: "bg-primary-50 ", iconColor: "text-primary-600 " },
 { icon: Clock, label: "Pending Claims", value: pendingClaims, gradient: "from-amber-500 to-orange-600", bg: "bg-amber-50 ", iconColor: "text-amber-600 " },
 { icon: IndianRupee, label: "Total Premium", value: formatCurrency(totalPremium), gradient: "from-emerald-500 to-teal-600", bg: "bg-emerald-50 ", iconColor: "text-emerald-600 " },
 { icon: CreditCard, label: "Upcoming Payment", value: nextPayment ? `${nextPayment.daysLeft}d` : "None", gradient: "from-violet-500 to-purple-600", bg: "bg-violet-50 ", iconColor: "text-violet-600 " },
 ];

 const quickActions = [
 {
 to: "/policies",
 label: "Explore Policies",
 description: "Compare new covers and benefits",
 icon: Shield,
 tone: "from-sky-500 to-cyan-500",
 },
 {
 to: "/claims",
 label: "Raise a Claim",
 description: "Track and manage claim workflow",
 icon: FileText,
 tone: "from-amber-500 to-orange-500",
 },
 {
 to: "/renewals",
 label: "Renew Coverage",
 description: "Prevent lapses before expiry",
 icon: RefreshCw,
 tone: "from-emerald-500 to-teal-500",
 },
 {
 to: "/recommendations",
 label: "AI Advice",
 description: "Get smarter policy suggestions",
 icon: BrainCircuit,
 tone: "from-violet-500 to-fuchsia-500",
 },
 ];

 return (
 <motion.div initial="hidden" animate="visible" variants={containerVariants} className="space-y-8 page-shell">
 {/* Decorative blurs */}
 <div className="pointer-events-none fixed inset-0 overflow-hidden">
 <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-primary-400/10 to-violet-400/8 blur-3xl" />
 <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-secondary-400/8 to-cyan-400/8 blur-3xl" />
 </div>

 <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
 <div className="relative overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(8,47,73,1)_42%,_rgba(30,41,59,1)_100%)] p-6 text-white shadow-2xl sm:p-8">
 <div className="absolute -right-14 top-0 h-44 w-44 rounded-full bg-sky-400/12 blur-3xl" />
 <div className="absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-cyan-300/12 blur-3xl" />
 <div
 className="absolute inset-0 opacity-[0.05]"
 style={{
 backgroundImage:
 "radial-gradient(circle, #fff 1px, transparent 1px)",
 backgroundSize: "20px 20px",
 }}
 />

 <div className="relative z-10">
 <div className="flex flex-wrap items-start justify-between gap-4">
 <div className="max-w-2xl">
 <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-200 backdrop-blur-sm">
 <UserCircle2 className="h-3.5 w-3.5" />
 User Dashboard
 </div>
 <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl">
 Good to see you, {firstName}
 </h1>
 <p className="mt-3 max-w-xl text-sm leading-6 text-slate-200/85 sm:text-base">
 This is your insurance command center for active coverage,
 upcoming renewals, family protection, and AI-backed risk insights.
 </p>
 </div>

 <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
 Profile Completion
 </p>
 <p className="mt-2 text-3xl font-bold">{completionPercent}%</p>
 <p className="mt-1 text-xs text-slate-300">
 Complete profile data improves pricing and claim speed.
 </p>
 </div>
 </div>

 <div className="mt-8 grid gap-4 lg:grid-cols-3">
 <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
 Coverage Snapshot
 </p>
 <div className="mt-3 flex items-end justify-between gap-3">
 <div>
 <p className="text-3xl font-bold">{activePolicies}</p>
 <p className="text-sm text-slate-300">Policies currently active</p>
 </div>
 <ShieldCheck className="h-8 w-8 text-sky-300" />
 </div>
 </div>

 <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
 Claim Momentum
 </p>
 <div className="mt-3 flex items-end justify-between gap-3">
 <div>
 <p className="text-3xl font-bold">{pendingClaims}</p>
 <p className="text-sm text-slate-300">Claims in progress</p>
 </div>
 <Activity className="h-8 w-8 text-amber-300" />
 </div>
 </div>

 <div className="rounded-3xl border border-white/10 bg-white/10 p-4 backdrop-blur-md">
 <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
 Support Signals
 </p>
 <div className="mt-3 space-y-2 text-sm text-slate-200">
 <div className="flex items-center justify-between">
 <span>Unread notifications</span>
 <span className="font-semibold">{openNotifications}</span>
 </div>
 <div className="flex items-center justify-between">
 <span>Assigned agent</span>
 <span className="font-semibold">{assignedAgent ? "Connected" : "Not Assigned"}</span>
 </div>
 </div>
 </div>
 </div>

 <div className="mt-6 flex flex-wrap gap-3">
 <ExportButton profile={profile} />
 <Link
 to="/policies"
 className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
 >
 <Sparkles className="h-4 w-4 text-primary-500" />
 Explore Policies
 </Link>
 <Link
 to="/recommendations"
 className="inline-flex items-center gap-2 rounded-xl bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/15"
 >
 <BrainCircuit className="h-4 w-4 text-violet-300" />
 AI Suggestions
 </Link>
 </div>
 </div>
 </div>

 <div className="grid gap-4">
 {quickActions.map((action) => {
 const Icon = action.icon;
 return (
 <Link
 key={action.label}
 to={action.to}
 className="group rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md"
 >
 <div className="flex items-start justify-between gap-4">
 <div>
 <div className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${action.tone}`}>
 <Icon className="h-5 w-5 text-white" />
 </div>
 <h2 className="mt-4 text-lg font-bold text-slate-900">{action.label}</h2>
 <p className="mt-1 text-sm leading-6 text-slate-500">{action.description}</p>
 </div>
 <ArrowRight className="mt-1 h-5 w-5 text-slate-300 transition group-hover:translate-x-1 group-hover:text-slate-500" />
 </div>
 </Link>
 );
 })}
 </div>
 </motion.section>

 {/* ═══ STAT CARDS ═══ */}
 <motion.section variants={itemVariants} className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
 {stats.map((stat) => <StatsCard key={stat.label} {...stat} />)}
 </motion.section>

 <motion.section variants={itemVariants} className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
 <div className="grid gap-6">
 <Card
 header={
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-cyan-500 shadow-md shadow-sky-500/20">
 <HeartHandshake className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-900 ">Portfolio Health</h2>
 <p className="text-xs text-slate-500 ">
 Your current protection posture at a glance
 </p>
 </div>
 </div>
 }
 >
 <div className="grid gap-4 md:grid-cols-3">
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Risk Score</p>
 <p className="mt-3 text-3xl font-bold text-slate-900 ">{riskScore}</p>
 <p className="mt-1 text-sm text-slate-500">
 {riskScore >= 70 ? "Stable and well-covered" : riskScore >= 40 ? "Moderate exposure" : "Needs attention"}
 </p>
 </div>
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Renewal Pressure</p>
 <p className="mt-3 text-3xl font-bold text-slate-900 ">{renewalReminders.length}</p>
 <p className="mt-1 text-sm text-slate-500">
 Policies needing action in the next 60 days
 </p>
 </div>
 <div className="rounded-2xl bg-slate-50 p-4 ">
 <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Household Members</p>
 <p className="mt-3 text-3xl font-bold text-slate-900 ">{profile?.dependents?.length || 0}</p>
 <p className="mt-1 text-sm text-slate-500">
 Family dependents added to your account
 </p>
 </div>
 </div>
 </Card>

 <ClaimsTracker claims={claims} />
 </div>

 <div className="flex flex-col gap-4 sm:gap-6">
 <ProfileCompletion profile={profile} />

 <Card
 padding={false}
 header={
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 shadow-md shadow-violet-500/20">
 <BrainCircuit className="h-4.5 w-4.5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-900 ">AI Insights</h2>
 <p className="text-xs text-slate-500 ">Your risk profile</p>
 </div>
 </div>
 }
 >
 <div className="flex flex-col items-center gap-5 p-6">
 <RiskGauge score={riskScore} />
 <div className="w-full space-y-2">
 <div className="rounded-xl bg-gradient-to-r from-primary-50 to-violet-50 p-3 ">
 <div className="flex items-center gap-2">
 <Sparkles className="h-3.5 w-3.5 text-primary-500" />
 <span className="text-xs font-bold text-primary-700 ">AI Recommendation</span>
 </div>
 <p className="mt-1.5 text-[11px] leading-relaxed text-slate-600 ">
 {riskScore >= 70
 ? "Great risk profile! Consider increasing your coverage for maximum protection."
 : riskScore >= 40
 ? "Your risk profile is moderate. Review your policy limits and deductibles."
 : "Your risk score needs attention. Consider updating your health and life coverage."}
 </p>
 </div>
 <Link to="/recommendations" className="flex w-full items-center justify-center gap-2 rounded-xl border border-primary-200 bg-primary-50 px-4 py-2.5 text-xs font-semibold text-primary-700 transition-all hover:bg-primary-100 hover:shadow-sm ">
 <Zap className="h-3.5 w-3.5" /> View Smart Recommendations
 </Link>
 </div>
 </div>
 </Card>

 <Card
 header={
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md shadow-amber-500/20">
 <AlertTriangle className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-base font-bold text-slate-900 ">Urgent Renewal Watch</h2>
 <p className="text-xs text-slate-500 ">Closest expiry windows</p>
 </div>
 </div>
 }
 >
 <div className="space-y-3">
 {renewalReminders.slice(0, 3).map((item) => (
 <Link
 key={item._id}
 to={`/renewals?purchaseId=${item._id}`}
 className="flex items-center justify-between rounded-2xl bg-amber-50/80 px-4 py-3 transition hover:bg-amber-100/70 "
 >
 <div>
 <p className="font-semibold text-slate-900 ">{item.policy?.name || "Policy"}</p>
 <p className="text-xs text-slate-500 ">
 Expires in {item.daysLeft} day(s)
 </p>
 </div>
 <Badge color="warning">{item.daysLeft}d</Badge>
 </Link>
 ))}

 {!renewalReminders.length && (
 <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500 ">
 No urgent renewals right now.
 </div>
 )}
 </div>
 </Card>
 </div>
 </motion.section>

 <motion.section variants={itemVariants} className="grid gap-6 lg:grid-cols-2">
 <DependentsList 
 dependents={profile?.dependents || []} 
 onUpdate={(newDependents) => setProfile(prev => ({ ...prev, dependents: newDependents }))} 
 />
 <PaymentHistory purchasedPolicies={purchasedPolicies} nextPayment={nextPayment} />
 </motion.section>

 <motion.section variants={itemVariants}>
 <NotificationsFeed notifications={notifications} onMarkRead={handleMarkRead} />
 </motion.section>

 <motion.section variants={itemVariants}>
 <Card
 padding={false}
 header={
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-md shadow-primary-500/20">
 <ShieldCheck className="h-5 w-5 text-white" />
 </div>
 <div>
 <h2 className="text-lg font-bold text-slate-900 ">Coverage Portfolio</h2>
 <p className="text-xs text-slate-500 ">{activePolicies} active {activePolicies === 1 ? "policy" : "policies"}</p>
 </div>
 </div>
 {activePolicies > 0 && (
 <Link to="/my-policies" className="flex items-center gap-1 text-sm font-medium text-primary-600 transition hover:text-primary-700 ">View all <ArrowRight className="h-3.5 w-3.5" /></Link>
 )}
 </div>
 }
 >
 <div className="divide-y divide-slate-100 ">
 {activePolicies > 0 ? (
 purchasedPolicies.slice(0, 5).map((item, idx) => (
 <motion.div
 key={item._id}
 initial={{ opacity: 0, x: -12 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.05 }}
 className="group flex items-center gap-4 px-6 py-4 transition-all duration-200 hover:bg-slate-50/50 "
 >
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-sm font-bold text-white shadow-md shadow-primary-500/20">{idx + 1}</div>
 <div className="flex-1 min-w-0">
 <p className="font-semibold text-slate-900 truncate">{item.policy?.name || "Policy"}</p>
 <div className="mt-1 flex items-center gap-3 text-xs text-slate-500 ">
 <span className="flex items-center gap-1"><IndianRupee className="h-3 w-3" /> {formatCurrency(item.amount)}</span>
 <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{new Date(item.purchasedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
 </div>
 </div>
 <div className="flex items-center gap-2">
 {item.validTo && (
 <Badge color={Math.ceil((new Date(item.validTo) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 ? "warning" : "success"}>
 Valid till {new Date(item.validTo).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
 </Badge>
 )}
 {item.policyDocumentPath && (
 <button type="button" onClick={() => downloadPolicyPdf(item._id)} className="inline-flex items-center gap-1.5 rounded-lg bg-primary-50 px-2.5 py-1.5 text-[11px] font-semibold text-primary-600 transition-all duration-200 hover:bg-primary-100 hover:shadow-sm ">
 <Download className="h-3 w-3" /> PDF
 </button>
 )}
 {item.policy?._id && (
 <Link to={`/policies/${item.policy._id}`} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 transition-all duration-200 hover:bg-slate-200 hover:shadow-sm ">
 <Eye className="h-3 w-3" /> View
 </Link>
 )}
 </div>
 </motion.div>
 ))
 ) : (
 <div className="flex flex-col items-center py-14 text-center">
 <ShieldCheck className="mb-3 h-12 w-12 text-slate-200 " />
 <p className="text-base font-semibold text-slate-500 ">No policies yet</p>
 <p className="mt-1 text-sm text-slate-400 ">Start protecting what matters most</p>
 <Link to="/policies" className="mt-4 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary-600 to-primary-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary-500/25 transition-all hover:shadow-xl hover:-translate-y-0.5">
 <Sparkles className="h-4 w-4" /> Explore Policies
 </Link>
 </div>
 )}
 </div>
 </Card>
 </motion.section>
 </motion.div>
 );
}
