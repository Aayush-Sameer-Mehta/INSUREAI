import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
  const location = useLocation();
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

  const quickActions = [
    {
      to: "/policies",
      label: "Explore Policies",
      icon: Shield,
      bgColor: "bg-sky-50 text-sky-600 group-hover:bg-sky-100",
    },
    {
      to: "/claims",
      label: "Raise Claim",
      icon: FileText,
      bgColor: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    },
    {
      to: "/renewals",
      label: "Renewals",
      icon: RefreshCw,
      bgColor: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    },
    {
      to: "/recommendations",
      label: "AI Advice",
      icon: BrainCircuit,
      bgColor: "bg-violet-50 text-violet-600 group-hover:bg-violet-100",
    },
  ];

  const linkState = {
    from: {
      pathname: location.pathname,
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-6 overflow-hidden px-1 pb-16 sm:px-0"
    >
        
        {/* Top Hero Section (Light Theme) */}
        <motion.section variants={itemVariants} className="relative overflow-hidden rounded-[2rem] bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
          {/* Subtle light background decorations */}
          <div className="absolute top-0 right-0 h-64 w-64 -translate-y-1/2 translate-x-1/3 rounded-full bg-primary-50/60 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-48 w-48 translate-y-1/3 -translate-x-1/3 rounded-full bg-cyan-50/60 blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.4]"
            style={{
              backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)",
              backgroundSize: "20px 20px",
            }}
          />
          
          <div className="relative z-10">
            <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
              <div className="max-w-xl">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-1 text-[11px] font-bold tracking-wide uppercase text-primary-700 border border-primary-100">
                  <Sparkles className="h-3 w-3" /> Welcome Back
                </div>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                  Good to see you, {firstName}
                </h1>
                <p className="mt-3 text-sm text-slate-500 leading-relaxed">
                  Here is your portfolio overview. You have <strong className="text-slate-700">{activePolicies} active policies</strong> and <strong className="text-slate-700">{openNotifications} new notifications</strong>.
                </p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    to="/policies"
                    state={linkState}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-primary-500/25 hover:bg-primary-700 hover:shadow-md hover:-translate-y-0.5 transition-all"
                  >
                    Explore Policies
                  </Link>
                  <ExportButton profile={profile} />
                </div>
              </div>

              {/* Top Quick Stats Bento */}
              <div className="flex flex-wrap gap-3 shrink-0">
                <div className="flex flex-col justify-center rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 px-6 py-5 text-center shadow-sm hover:bg-white transition-colors">
                  <p className="text-3xl font-bold text-slate-800">{activePolicies}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Active<br/>Policies</p>
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 px-6 py-5 text-center shadow-sm hover:bg-white transition-colors">
                  <p className="text-3xl font-bold text-slate-800">{pendingClaims}</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Pending<br/>Claims</p>
                </div>
                <div className="flex flex-col justify-center rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200 px-6 py-5 text-center shadow-sm hover:bg-white transition-colors">
                  <p className="text-3xl font-bold text-slate-800">{completionPercent}%</p>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2">Profile<br/>Complete</p>
                </div>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions Row */}
        <motion.section variants={itemVariants} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              to={action.to}
              state={linkState}
              className="group flex items-center gap-4 rounded-2xl bg-white border border-slate-200 p-4 transition-all duration-200 hover:border-slate-300 hover:shadow-md hover:-translate-y-0.5"
            >
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-colors ${action.bgColor}`}>
                <action.icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-bold text-slate-700 group-hover:text-slate-900">{action.label}</span>
            </Link>
          ))}
        </motion.section>

        {/* Bento Grid Layer 1 */}
        <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <Card
            padding={false}
            className="overflow-hidden"
            header={
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-50 to-primary-100 text-primary-600 shadow-inner">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Coverage Portfolio</h2>
                    <p className="text-xs font-medium text-slate-500">{activePolicies} active policies</p>
                  </div>
                </div>
                {activePolicies > 0 && (
                  <Link to="/my-policies" state={linkState} className="flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-primary-600 hover:text-primary-700 transition-colors">View all <ArrowRight className="h-3 w-3" /></Link>
                )}
              </div>
            }
          >
            <div className="divide-y divide-slate-100/80">
              {activePolicies > 0 ? (
                purchasedPolicies.slice(0, 4).map((item) => (
                  <div key={item._id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-5 hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="hidden sm:flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 border border-slate-200">
                        <Shield className="h-4 w-4 text-slate-500" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate">{item.policy?.name || "Policy"}</p>
                        <div className="mt-1 flex items-center gap-3 text-xs font-medium text-slate-500">
                          <span className="flex items-center gap-1 text-slate-600"><IndianRupee className="h-3 w-3" /> {formatCurrency(item.amount)}</span>
                          <span className="h-1 w-1 rounded-full bg-slate-300"></span>
                          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {new Date(item.purchasedAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {item.validTo && (
                        <Badge color={Math.ceil((new Date(item.validTo) - new Date()) / (1000 * 60 * 60 * 24)) <= 30 ? "warning" : "success"}>
                          Till {new Date(item.validTo).toLocaleDateString("en-IN", { month: "short", year: "2-digit" })}
                        </Badge>
                      )}
                      {item.policy?._id && (
                        <Link to={`/policies/${item.policy._id}`} state={linkState} className="rounded-lg bg-slate-50 border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors shadow-sm">
                          <Eye className="h-4 w-4" />
                        </Link>
                      )}
                      {item.policyDocumentPath && (
                        <button onClick={() => downloadPolicyPdf(item._id)} className="rounded-lg bg-primary-50 border border-primary-100 p-2 text-primary-600 hover:bg-primary-100 transition-colors shadow-sm">
                          <Download className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                    <ShieldCheck className="h-8 w-8 text-slate-300" />
                  </div>
                  <p className="text-sm font-bold text-slate-700">No active policies found</p>
                  <p className="text-xs text-slate-500 mt-1 max-w-sm">You currently don't have any active insurance policies. Explore our offerings to get covered.</p>
                  <Link to="/policies" state={linkState} className="mt-6 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2 text-sm font-semibold text-white hover:bg-slate-800 transition">
                    Explore Policies
                  </Link>
                </div>
              )}
            </div>
          </Card>

          <div className="flex flex-col gap-6">
            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-50 to-violet-100 text-violet-600 shadow-inner">
                    <BrainCircuit className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Risk Profile</h2>
                    <p className="text-xs font-medium text-slate-500">AI-driven analysis</p>
                  </div>
                </div>
              }
            >
              <div className="flex flex-col items-center justify-center pt-2">
                <RiskGauge score={riskScore} />
                <div className="mt-6 w-full rounded-xl bg-violet-50/80 border border-violet-100 p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-violet-600" />
                    <span className="text-xs font-bold text-violet-800 uppercase tracking-wide">AI Insight</span>
                  </div>
                  <p className="text-xs leading-relaxed text-slate-600">
                    {riskScore >= 70 ? "Your profile is stable and well-protected. Keep an eye on renewals." : "Consider adjusting your coverage. You have a moderate exposure risk."}
                  </p>
                </div>
              </div>
            </Card>

            <Card
              header={
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 shadow-inner">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Urgent Renewals</h2>
                    <p className="text-xs font-medium text-slate-500">Next 60 days</p>
                  </div>
                </div>
              }
            >
              <div className="space-y-3">
                {renewalReminders.slice(0, 3).map((item) => (
                  <Link key={item._id} to={`/renewals?purchaseId=${item._id}`} state={linkState} className="group flex items-center justify-between rounded-xl bg-amber-50/50 border border-amber-100 px-4 py-3 hover:bg-amber-50 hover:border-amber-200 transition-all">
                    <div className="min-w-0 pr-3">
                      <p className="text-sm font-bold text-slate-800 truncate group-hover:text-amber-900">{item.policy?.name || "Policy"}</p>
                      <p className="text-[11px] font-medium text-amber-600/80 mt-0.5">Expires in {item.daysLeft} days</p>
                    </div>
                    <Badge color="warning" className="shrink-0">{item.daysLeft}d</Badge>
                  </Link>
                ))}
                {!renewalReminders.length && (
                  <div className="rounded-xl border border-dashed border-slate-200 p-6 text-center">
                    <ShieldCheck className="mx-auto h-6 w-6 text-emerald-400 mb-2" />
                    <p className="text-xs font-bold text-slate-700">All caught up</p>
                    <p className="text-[11px] text-slate-500 mt-1">No upcoming renewals.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </motion.section>

        {/* Bento Grid Layer 2 */}
        <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-2">
          <ClaimsTracker claims={claims} />
          <DependentsList dependents={profile?.dependents || []} onUpdate={(newDependents) => setProfile(prev => ({ ...prev, dependents: newDependents }))} />
        </motion.section>

        {/* Bento Grid Layer 3 */}
        <motion.section variants={itemVariants} className="grid gap-6 xl:grid-cols-2">
          <PaymentHistory purchasedPolicies={purchasedPolicies} nextPayment={nextPayment} />
          <NotificationsFeed notifications={notifications} onMarkRead={handleMarkRead} />
        </motion.section>

    </motion.div>
  );
}
