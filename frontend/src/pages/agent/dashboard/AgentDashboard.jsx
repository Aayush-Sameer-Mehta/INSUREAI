import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
 ArrowRight,
 Briefcase,
 CheckCircle2,
 CircleAlert,
 CircleDollarSign,
 Clock3,
 FileBadge2,
 FileText,
 PhoneCall,
 ShieldCheck,
 Users,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../../hooks/useAuth";
import agentWorkspaceService from "../../../services/agentWorkspaceService";

function formatCurrency(amount) {
 return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}

function formatDate(value, fallback = "Not scheduled") {
 if (!value) return fallback;
 const date = new Date(value);
 if (Number.isNaN(date.getTime())) return fallback;
 return date.toLocaleDateString("en-IN", {
 day: "2-digit",
 month: "short",
 year: "numeric",
 });
}

function StatCard({ icon: Icon, label, value, tone = "primary" }) {
 const tones = {
 primary: "from-sky-500 to-cyan-500",
 success: "from-emerald-500 to-lime-500",
 warning: "from-amber-500 to-orange-500",
 slate: "from-slate-700 to-slate-900",
 };

 return (
 <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
 <div className="flex items-center justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
 {label}
 </p>
 <p className="mt-3 text-3xl font-bold text-slate-900">{value}</p>
 </div>
 <div className={`flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${tones[tone]}`}>
 <Icon className="h-5 w-5 text-white" />
 </div>
 </div>
 </div>
 );
}

export default function AgentDashboard() {
 const { user } = useAuth();
 const [dashboard, setDashboard] = useState(null);
 const [loading, setLoading] = useState(true);

 useEffect(() => {
 let isMounted = true;

 const loadDashboard = async () => {
 try {
 const payload = await agentWorkspaceService.getDashboard();
 if (isMounted) {
 setDashboard(payload);
 }
 } catch (error) {
 toast.error(error?.response?.data?.message || "Failed to load agent dashboard");
 } finally {
 if (isMounted) {
 setLoading(false);
 }
 }
 };

 loadDashboard();

 return () => {
 isMounted = false;
 };
 }, []);

 const summary = useMemo(
 () => ({
 assignedCustomers: dashboard?.summary?.assignedCustomers || 0,
 claimsAssisted: dashboard?.summary?.claimsAssisted || 0,
 pendingCommissionAmount: dashboard?.summary?.pendingCommissionAmount || 0,
 renewalsDue: dashboard?.summary?.renewalsDue || 0,
 }),
 [dashboard],
 );

 const operations = useMemo(() => {
 const commissions = dashboard?.commissions || [];
 const claims = dashboard?.claims || [];
 const renewals = dashboard?.renewals || [];
 const customers = dashboard?.customers || [];

 return {
 pendingCommissions: commissions.filter((item) => item.commission_status === "Pending").length,
 underReviewClaims: claims.filter((item) => item.status === "Under Review" || item.approval_status === "Pending").length,
 approvedClaims: claims.filter((item) => item.status === "Approved" || item.approval_status === "Approved").length,
 highRiskCustomers: customers.filter((item) => item.user_profile?.risk_profile === "High").length,
 totalPremium: commissions.reduce((sum, item) => sum + (item.premium_amount || 0), 0),
 renewalsInProgress: renewals.filter((item) => item.renewal_status === "In Progress").length,
 };
 }, [dashboard]);

 const focusQueue = useMemo(() => {
 const upcomingRenewals = (dashboard?.renewals || []).slice(0, 2).map((item) => ({
 id: item._id,
 title: item.user_id?.fullName || "Customer",
 subtitle: item.policy_id?.name || "Renewal follow-up",
 meta: item.renewal_status || "Pending",
 tone: "bg-sky-50 text-sky-700",
 icon: Clock3,
 }));

 const pendingClaims = (dashboard?.claims || [])
 .filter((item) => item.approval_status === "Pending" || item.status === "Under Review")
 .slice(0, 2)
 .map((item) => ({
 id: item._id,
 title: item.user?.fullName || "Customer",
 subtitle: item.policy?.name || item.reason || "Claim review",
 meta: item.status || item.approval_status,
 tone: "bg-amber-50 text-amber-700",
 icon: FileBadge2,
 }));

 const highRiskCustomers = (dashboard?.customers || [])
 .filter((item) => item.user_profile?.risk_profile === "High")
 .slice(0, 2)
 .map((item) => ({
 id: item._id,
 title: item.fullName || "Customer",
 subtitle: item.email || "High-risk customer",
 meta: "Priority outreach",
 tone: "bg-rose-50 text-rose-700",
 icon: PhoneCall,
 }));

 return [...upcomingRenewals, ...pendingClaims, ...highRiskCustomers].slice(0, 6);
 }, [dashboard]);

 if (loading) {
 return (
 <div className="flex min-h-[40vh] items-center justify-center">
 <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
 </div>
 );
 }

 return (
 <div className="mx-auto max-w-7xl space-y-8">
 <section className="rounded-[2rem] border border-slate-200 bg-[linear-gradient(135deg,_rgba(15,23,42,1),_rgba(14,116,144,0.95))] px-6 py-8 text-white shadow-xl sm:px-8">
 <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-[0.25em] text-sky-200">
 Agent Workspace
 </p>
 <h1 className="mt-3 text-3xl font-bold tracking-tight">
 Welcome back, {user?.fullName || "Agent"}
 </h1>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-200">
 Manage assigned customers, follow up on renewals, and keep your
 commission pipeline moving from one place.
 </p>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 <Link
 to="/agent/clients"
 className="rounded-2xl bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur transition hover:bg-white/15"
 >
 Open Workflow Panel
 </Link>
 <Link
 to="/policies"
 className="rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
 >
 Browse Policies
 </Link>
 </div>
 </div>
 </section>

 <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
 <StatCard icon={Users} label="Assigned Customers" value={summary.assignedCustomers} />
 <StatCard icon={FileText} label="Claims Assisted" value={summary.claimsAssisted} tone="success" />
 <StatCard
 icon={CircleDollarSign}
 label="Pending Commission"
 value={formatCurrency(summary.pendingCommissionAmount)}
 tone="warning"
 />
 <StatCard icon={Clock3} label="Renewals Due" value={summary.renewalsDue} tone="slate" />
 </section>

 <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
 <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="mb-5 flex items-center justify-between gap-3">
 <div>
 <h2 className="text-xl font-bold text-slate-900">Today&apos;s focus queue</h2>
 <p className="mt-1 text-sm text-slate-500">
 Priority customer actions assembled from renewals, claims, and high-risk accounts.
 </p>
 </div>
 <Link to="/agent/clients" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
 Manage portfolio
 </Link>
 </div>

 <div className="space-y-3">
 {focusQueue.map((item) => {
 const Icon = item.icon;
 return (
 <div key={item.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3">
 <div className="flex items-start gap-3">
 <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-2xl ${item.tone}`}>
 <Icon className="h-4 w-4" />
 </div>
 <div>
 <p className="font-semibold text-slate-900">{item.title}</p>
 <p className="text-sm text-slate-500">{item.subtitle}</p>
 </div>
 </div>
 <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.tone}`}>
 {item.meta}
 </span>
 </div>
 );
 })}

 {!focusQueue.length && (
 <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
 No urgent actions at the moment.
 </div>
 )}
 </div>
 </div>

 <div className="grid gap-4 sm:grid-cols-2">
 {[
 {
 label: "Pending commissions",
 value: operations.pendingCommissions,
 helper: `${formatCurrency(summary.pendingCommissionAmount)} still unpaid`,
 icon: CircleDollarSign,
 tone: "bg-amber-50 text-amber-700",
 },
 {
 label: "Claims under review",
 value: operations.underReviewClaims,
 helper: `${operations.approvedClaims} approved recently`,
 icon: FileBadge2,
 tone: "bg-sky-50 text-sky-700",
 },
 {
 label: "High-risk customers",
 value: operations.highRiskCustomers,
 helper: "Prioritize advisor outreach",
 icon: CircleAlert,
 tone: "bg-rose-50 text-rose-700",
 },
 {
 label: "Premium influenced",
 value: formatCurrency(operations.totalPremium),
 helper: `${operations.renewalsInProgress} renewals in progress`,
 icon: CheckCircle2,
 tone: "bg-emerald-50 text-emerald-700",
 },
 ].map((item) => {
 const Icon = item.icon;
 return (
 <div key={item.label} className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="text-sm font-semibold text-slate-500">{item.label}</p>
 <p className="mt-3 text-2xl font-bold text-slate-900">{item.value}</p>
 <p className="mt-2 text-sm text-slate-500">{item.helper}</p>
 </div>
 <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.tone}`}>
 <Icon className="h-4 w-4" />
 </div>
 </div>
 </div>
 );
 })}
 </div>
 </section>

 <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
 <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="mb-5 flex items-center justify-between">
 <div>
 <h2 className="text-xl font-bold text-slate-900">Assigned Customers</h2>
 <p className="mt-1 text-sm text-slate-500">
 Recent customers currently mapped to your agent account.
 </p>
 </div>
 <Link to="/agent/clients" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
 Open full list
 </Link>
 </div>

 <div className="space-y-3">
 {(dashboard?.customers || []).slice(0, 5).map((customer) => (
 <div
 key={customer._id}
 className="flex items-center justify-between rounded-2xl border border-slate-200 px-4 py-3"
 >
 <div>
 <p className="font-semibold text-slate-900">{customer.fullName}</p>
 <p className="text-sm text-slate-500">{customer.email}</p>
 </div>
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 {customer.user_profile?.risk_profile || "Medium"} Risk
 </span>
 </div>
 ))}

 {!dashboard?.customers?.length && (
 <div className="rounded-2xl border border-dashed border-slate-300 px-4 py-10 text-center text-sm text-slate-500">
 No assigned customers yet.
 </div>
 )}
 </div>
 </div>

 <div className="space-y-6">
 <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="mb-4 flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-100">
 <ShieldCheck className="h-5 w-5 text-emerald-600" />
 </div>
 <div>
 <h2 className="font-bold text-slate-900">Commission Snapshot</h2>
 <p className="text-sm text-slate-500">Latest pending payouts</p>
 </div>
 </div>

 <div className="space-y-3">
 {(dashboard?.commissions || []).slice(0, 4).map((item) => (
 <div key={item._id} className="rounded-2xl bg-slate-50 px-4 py-3">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="font-semibold text-slate-900">{item.user_id?.fullName || "Customer"}</p>
 <p className="text-xs text-slate-500">{item.policy_id?.name || "Policy"}</p>
 </div>
 <div className="text-right">
 <p className="font-semibold text-slate-900">
 {formatCurrency(item.commission_amount)}
 </p>
 <p className="text-xs text-amber-600">{item.commission_status || "Pending"}</p>
 </div>
 </div>
 </div>
 ))}

 {!dashboard?.commissions?.length && (
 <p className="text-sm text-slate-500">No commission records available.</p>
 )}
 </div>
 </div>

 <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="mb-4 flex items-center gap-3">
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100">
 <Briefcase className="h-5 w-5 text-sky-700" />
 </div>
 <div>
 <h2 className="font-bold text-slate-900">Renewal Queue</h2>
 <p className="text-sm text-slate-500">Policies needing follow-up</p>
 </div>
 </div>

 <div className="space-y-3">
 {(dashboard?.renewals || []).slice(0, 4).map((renewal) => (
 <div key={renewal._id} className="rounded-2xl border border-slate-200 px-4 py-3">
 <p className="font-semibold text-slate-900">{renewal.user_id?.fullName || "Customer"}</p>
 <p className="text-sm text-slate-500">{renewal.policy_id?.name || "Policy"}</p>
 <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
 {renewal.renewal_status || "Pending"}
 </p>
 </div>
 ))}

 {!dashboard?.renewals?.length && (
 <p className="text-sm text-slate-500">No renewal follow-ups pending.</p>
 )}
 </div>
 </div>
 </div>
 </section>

 <section className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
 <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="mb-5 flex items-center justify-between">
 <div>
 <h2 className="text-xl font-bold text-slate-900">Claims pipeline</h2>
 <p className="mt-1 text-sm text-slate-500">
 Recent assisted claims that may need a customer update or documentation push.
 </p>
 </div>
 <Link to="/agent/clients" className="text-sm font-semibold text-sky-700 hover:text-sky-800">
 View client workflow
 </Link>
 </div>

 <div className="space-y-3">
 {(dashboard?.claims || []).slice(0, 5).map((claim) => (
 <div key={claim._id} className="rounded-2xl border border-slate-200 px-4 py-3">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold text-slate-900">{claim.user?.fullName || "Customer"}</p>
 <p className="text-sm text-slate-500">{claim.policy?.name || claim.reason || "Claim"}</p>
 </div>
 <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
 {claim.status || claim.approval_status || "Pending"}
 </span>
 </div>
 <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500">
 <span>{formatCurrency(claim.claimAmount)}</span>
 <span>{formatDate(claim.createdAt)}</span>
 </div>
 </div>
 ))}

 {!dashboard?.claims?.length && (
 <p className="text-sm text-slate-500">No claims are currently assigned to you.</p>
 )}
 </div>
 </div>

 <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
 <div className="mb-5 flex items-center justify-between">
 <div>
 <h2 className="text-xl font-bold text-slate-900">Quick actions</h2>
 <p className="mt-1 text-sm text-slate-500">
 Jump straight into the most common agent tasks.
 </p>
 </div>
 </div>

 <div className="grid gap-3 sm:grid-cols-2">
 {[
 {
 to: "/agent/clients",
 title: "Open workflow panel",
 description: "Review customer status, notes, and next actions.",
 icon: Users,
 },
 {
 to: "/agent/clients",
 title: "Schedule follow-ups",
 description: "Set next outreach and close the loop with customers.",
 icon: PhoneCall,
 },
 {
 to: "/agent/clients",
 title: "Review claims",
 description: "Check assisted claims and pending review states.",
 icon: FileText,
 },
 {
 to: "/policies",
 title: "Browse policies",
 description: "Explore products before the next recommendation call.",
 icon: ArrowRight,
 },
 ].map((item) => {
 const Icon = item.icon;
 return (
 <Link
 key={item.title}
 to={item.to}
 className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-slate-300 hover:bg-white"
 >
 <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
 <Icon className="h-4 w-4" />
 </div>
 <h3 className="mt-4 font-semibold text-slate-900">{item.title}</h3>
 <p className="mt-1 text-sm text-slate-500">{item.description}</p>
 </Link>
 );
 })}
 </div>
 </div>
 </section>
 </div>
 );
}
