import { useEffect, useState, useMemo } from "react";
import {
 FileWarning, CheckCircle2, XCircle, Clock, Eye, Send, X,
 User, Shield, Calendar, IndianRupee, MessageSquare,
 AlertTriangle, Filter, Brain, Sparkles, CheckSquare,
 ShieldAlert, ChevronLeft, ChevronRight, Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAdminClaims, reviewFraudClaim, updateClaimStatus } from "../../services/adminService";
import { analyzeClaimAI } from "../../services/claimService";
import AIInsightPanel, { RiskBadge } from "../../components/AIInsightPanel";

const STATUS_TABS = [
 { label: "All", value: "" },
 { label: "Submitted", value: "Submitted" },
 { label: "Under Review", value: "Under Review" },
 { label: "Approved", value: "Approved" },
 { label: "Rejected", value: "Rejected" },
 { label: "Paid", value: "Paid" },
];

const STATUS_BADGE = {
 Submitted: "badge-info",
 "Under Review": "badge-warning",
 Approved: "badge-success",
 Rejected: "badge-danger",
 Paid: "badge-success",
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } } };

const PAGE_SIZE = 10;

export default function AdminClaims() {
 const [claims, setClaims] = useState([]);
 const [loading, setLoading] = useState(true);
 const [tab, setTab] = useState("");
 const [search, setSearch] = useState("");
 const [page, setPage] = useState(1);
 const [selected, setSelected] = useState(null);
 const [newStatus, setNewStatus] = useState("");
 const [remarks, setRemarks] = useState("");
 const [updating, setUpdating] = useState(false);
 const [sortByRisk, setSortByRisk] = useState(false);

 // AI State
 const [aiAnalysis, setAiAnalysis] = useState(null);
 const [aiLoading, setAiLoading] = useState(false);

 // Bulk selection
 const [selectedIds, setSelectedIds] = useState(new Set());
 const [bulkUpdating, setBulkUpdating] = useState(false);

 const load = (statusFilter) => {
 setLoading(true);
 getAdminClaims(statusFilter || undefined)
 .then(setClaims)
 .catch(() => toast.error("Failed to load claims"))
 .finally(() => setLoading(false));
 };

 useEffect(() => { load(tab); }, [tab]);

 const filteredClaims = useMemo(() => {
 let result = claims;
 if (search) {
 const q = search.toLowerCase();
 result = result.filter((c) =>
 c.claimId?.toLowerCase().includes(q) ||
 c.user?.fullName?.toLowerCase().includes(q) ||
 c.policy?.name?.toLowerCase().includes(q)
 );
 }
 if (sortByRisk) {
 result = [...result].sort((a, b) => (b.fraudRiskScore || 0) - (a.fraudRiskScore || 0));
 }
 return result;
 }, [claims, search, sortByRisk]);

 const totalPages = Math.ceil(filteredClaims.length / PAGE_SIZE);
 const paginated = filteredClaims.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

 useEffect(() => { setPage(1); }, [search, tab]);

 const openDetail = async (claim) => {
 setSelected(claim);
 setNewStatus(claim.status);
 setRemarks(claim.adminRemarks || "");
 setAiAnalysis(null);

 setAiLoading(true);
 try {
 const policyId = claim.policy?.policyId || claim.policy?._id;
 if (policyId) {
 const result = await analyzeClaimAI({
 policyId,
 claimAmount: claim.claimAmount,
 incidentDate: claim.incidentDate,
 description: claim.reason,
 documents: claim.documents || [],
 });
 setAiAnalysis(result);
 }
 } catch {
 /* non-blocking */
 } finally {
 setAiLoading(false);
 }
 };

 const handleUpdate = async () => {
 if (!selected || !newStatus) return;
 setUpdating(true);
 try {
 await updateClaimStatus(selected._id, newStatus, remarks);
 setClaims((prev) =>
 prev.map((c) => (c._id === selected._id ? { ...c, status: newStatus, adminRemarks: remarks } : c))
 );
 toast.success("Claim updated");
 setSelected(null);
 } catch (err) {
 toast.error(err?.response?.data?.message || "Update failed");
 } finally {
 setUpdating(false);
 }
 };

 const handleFraudDecision = async (decision) => {
 if (!selected) return;
 setUpdating(true);
 try {
 await reviewFraudClaim(selected._id, {
 decision,
 status: decision === "reject" ? "Rejected" : newStatus,
 adminRemarks: remarks,
 });
 toast.success(`Fraud review ${decision}ed`);
 setSelected(null);
 load(tab);
 } catch (err) {
 toast.error(err?.response?.data?.message || "Fraud review update failed");
 } finally {
 setUpdating(false);
 }
 };

 const handleAIApprove = () => {
 if (!aiAnalysis || aiAnalysis.approvalProbability < 70) return;
 setNewStatus("Approved");
 setRemarks(`[AI Approved] Approval probability: ${aiAnalysis.approvalProbability}%. ${aiAnalysis.reasoning || ""}`);
 };

 const handleAIReject = () => {
 if (!aiAnalysis || aiAnalysis.fraudRiskScore < 60) return;
 setNewStatus("Rejected");
 setRemarks(`[AI Rejected] Fraud risk: ${aiAnalysis.fraudRiskScore}%. ${aiAnalysis.flags?.join(", ") || ""}`);
 };

 const handleBulkApprove = async () => {
 const lowRiskIds = [...selectedIds].filter((id) => {
 const claim = claims.find((c) => c._id === id);
 return claim && (claim.fraudRiskScore || 0) < 40 && claim.status === "Submitted";
 });
 if (lowRiskIds.length === 0) return toast.error("No eligible low-risk claims selected");

 setBulkUpdating(true);
 let successCount = 0;
 for (const id of lowRiskIds) {
 try { await updateClaimStatus(id, "Approved", "[Bulk AI Approved] Low fraud risk"); successCount++; } catch { /* continue */ }
 }
 toast.success(`${successCount} claims approved`);
 setSelectedIds(new Set());
 setBulkUpdating(false);
 load(tab);
 };

 const toggleSelection = (id) => {
 setSelectedIds((prev) => {
 const next = new Set(prev);
 if (next.has(id)) next.delete(id); else next.add(id);
 return next;
 });
 };

 const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
 const fmtCurrency = (n) => `₹${Number(n || 0).toLocaleString("en-IN")}`;

 const FraudBadge = ({ level, score }) => {
 const config = {
 "High Risk": { cls: "badge-danger", icon: AlertTriangle },
 "Medium Risk": { cls: "badge-warning", icon: AlertTriangle },
 };
 const c = config[level] || { cls: "badge-success", icon: CheckCircle2 };
 const Icon = c.icon;
 return (
 <span className={`${c.cls} gap-1`}>
 <Icon className="h-3 w-3" /> {level || "Low Risk"} ({score || 0})
 </span>
 );
 };

 return (
 <motion.div initial="visible" animate="visible" variants={containerVariants} className="space-y-6">
 {/* Header */}
 <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="section-title flex items-center gap-2">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-700 shadow-inner">
 <FileWarning className="h-5 w-5 text-white" />
 </div>
 Claims Intelligence
 </h1>
 <p className="section-subtitle mt-1">AI-powered claims review and management</p>
 </div>
 <div className="flex items-center gap-3">
 <button
 onClick={() => setSortByRisk(!sortByRisk)}
 className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
 sortByRisk ? "bg-red-100 text-red-700 " : "bg-slate-100 text-slate-600 "
 }`}
 >
 <ShieldAlert className="h-3.5 w-3.5" />
 {sortByRisk ? "Sorted by Risk" : "Sort by Risk"}
 </button>
 </div>
 </motion.div>

 {/* Bulk Actions */}
 {selectedIds.size > 0 && (
 <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-3 ">
 <CheckSquare className="h-4 w-4 text-indigo-600 " />
 <span className="text-sm font-medium text-indigo-700 ">{selectedIds.size} claim(s) selected</span>
 <button onClick={handleBulkApprove} disabled={bulkUpdating} className="ml-auto rounded-lg bg-emerald-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700">
 {bulkUpdating ? "Processing..." : "Bulk Approve Low-Risk"}
 </button>
 <button onClick={() => setSelectedIds(new Set())} className="rounded-lg bg-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 ">Clear</button>
 </motion.div>
 )}

 {/* Search + Status Tabs */}
 <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
 <div className="relative min-w-[200px] max-w-xs">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
 <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search claims..." className="glass-input !pl-10" />
 </div>
 <div className="flex flex-wrap gap-2">
 {STATUS_TABS.map((t) => (
 <button
 key={t.value}
 onClick={() => setTab(t.value)}
 className={`rounded-xl px-4 py-2 text-sm font-medium transition-all ${
 tab === t.value
 ? "bg-gradient-to-r from-primary-600 to-primary-700 text-white shadow-lg shadow-primary-600/25"
 : "bg-slate-100 text-slate-600 hover:bg-slate-200 "
 }`}
 >
 {t.label}
 </button>
 ))}
 </div>
 <span className="text-xs text-slate-500 ml-auto">
 <Filter className="inline h-3.5 w-3.5 mr-1" />{filteredClaims.length} results
 </span>
 </motion.div>

 {/* Claims Table */}
 {loading ? (
 <div className="panel p-0 overflow-hidden">
 {[...Array(4)].map((_, i) => (
 <div key={i} className="flex gap-4 border-b border-slate-100 px-4 py-4 ">
 <div className="flex-1 space-y-2"><div className="skeleton h-4 w-28" /><div className="skeleton h-3 w-40" /></div>
 <div className="skeleton h-6 w-20 rounded-full" />
 </div>
 ))}
 </div>
 ) : (
 <motion.div variants={itemVariants} className="panel-soft overflow-hidden p-0 relative">
 <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
 <div className="relative overflow-x-auto">
 <table className="data-table">
 <thead>
 <tr>
 <th className="w-10">
 <input type="checkbox" className="rounded" checked={selectedIds.size === paginated.length && paginated.length > 0}
 onChange={(e) => { if (e.target.checked) setSelectedIds(new Set(paginated.map((c) => c._id))); else setSelectedIds(new Set()); }} />
 </th>
 <th>Claim ID</th>
 <th>User</th>
 <th>Policy</th>
 <th>Amount</th>
 <th>Date</th>
 <th>Status</th>
 <th>Fraud Risk</th>
 <th>Action</th>
 </tr>
 </thead>
 <tbody>
 {paginated.map((claim) => (
 <tr key={claim._id} className={selectedIds.has(claim._id) ? "bg-indigo-50/50 " : ""}>
 <td>
 <input type="checkbox" className="rounded" checked={selectedIds.has(claim._id)} onChange={() => toggleSelection(claim._id)} />
 </td>
 <td className="font-mono text-xs text-primary-600 ">{claim.claimId}</td>
 <td>
 <div className="flex items-center gap-2">
 <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[10px] font-bold text-white">
 {claim.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
 </div>
 <span className="text-slate-900 ">{claim.user?.fullName || "—"}</span>
 </div>
 </td>
 <td>{claim.policy?.name || "—"}</td>
 <td className="font-medium text-slate-900 ">{fmtCurrency(claim.claimAmount)}</td>
 <td className="text-slate-500 ">{fmtDate(claim.createdAt)}</td>
 <td><span className={`badge ${STATUS_BADGE[claim.status] || ""}`}>{claim.status}</span></td>
 <td><FraudBadge level={claim.fraudRiskLevel} score={claim.fraudRiskScore} /></td>
 <td>
 <button onClick={() => openDetail(claim)} className="rounded-lg bg-primary-50 p-2 text-primary-700 transition hover:bg-primary-100 ">
 <Eye className="h-3.5 w-3.5" />
 </button>
 </td>
 </tr>
 ))}
 {paginated.length === 0 && (
 <tr><td colSpan={9} className="!py-12 text-center">
 <FileWarning className="mx-auto mb-3 h-8 w-8 text-slate-300 " />
 <p className="text-sm text-slate-400">No claims found</p>
 </td></tr>
 )}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 ">
 <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
 <div className="flex gap-1.5">
 <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 ">
 <ChevronLeft className="h-4 w-4" />
 </button>
 <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 ">
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 )}
 </motion.div>
 )}

 {/* Claim Detail Modal + AI Panel */}
 <AnimatePresence>
 {selected && (
 <div className="modal-overlay" onClick={() => setSelected(null)}>
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
 className="modal-content w-full max-w-2xl max-h-[90vh] overflow-auto" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-md">
 <FileWarning className="h-4 w-4" />
 </div>
 <div>
 <h3 className="text-lg font-bold text-slate-900 ">Claim {selected.claimId}</h3>
 <span className={`badge ${STATUS_BADGE[selected.status] || ""}`}>{selected.status}</span>
 </div>
 </div>
 <button onClick={() => setSelected(null)} className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 ">
 <X className="h-5 w-5" />
 </button>
 </div>

 <div className="mt-5 space-y-4">
 {/* Info Grid */}
 <div className="grid grid-cols-2 gap-3">
 {[
 { icon: User, label: "User", value: selected.user?.fullName || "—" },
 { icon: Shield, label: "Policy", value: selected.policy?.name || "—" },
 { icon: IndianRupee, label: "Claim Amount", value: fmtCurrency(selected.claimAmount) },
 { icon: Calendar, label: "Incident Date", value: fmtDate(selected.incidentDate) },
 ].map((item) => (
 <div key={item.label} className="rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50/50 ">
 <div className="flex items-center gap-1.5 text-xs text-slate-500 "><item.icon className="h-3 w-3" />{item.label}</div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">{item.value}</p>
 </div>
 ))}
 </div>

 {/* Reason */}
 <div className="rounded-xl border border-slate-100 p-3 ">
 <p className="text-xs font-medium text-slate-500 ">Claim Reason</p>
 <p className="mt-1 text-sm text-slate-900 ">{selected.reason || "—"}</p>
 </div>

 {/* Documents */}
 {selected.documents?.length > 0 && (
 <div className="rounded-xl border border-slate-100 p-3 ">
 <p className="text-xs font-medium text-slate-500 ">Documents ({selected.documents.length})</p>
 <div className="mt-2 flex flex-wrap gap-2">
 {selected.documents.map((doc, i) => (
 <a key={i} href={doc} target="_blank" rel="noopener noreferrer"
 className="rounded-lg bg-primary-50 px-3 py-1.5 text-xs font-medium text-primary-600 transition hover:bg-primary-100 ">
 Document {i + 1}
 </a>
 ))}
 </div>
 </div>
 )}

 {/* AI Recommendation Panel */}
 <AIInsightPanel analysis={aiAnalysis} loading={aiLoading} compact />

 {/* AI Smart Actions */}
 {aiAnalysis && (
 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-wrap gap-2">
 {aiAnalysis.approvalProbability >= 70 && (
 <button onClick={handleAIApprove} className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition-all hover:bg-emerald-100 ">
 <Sparkles className="h-3.5 w-3.5" /> AI Approve (High Confidence)
 </button>
 )}
 {aiAnalysis.fraudRiskScore >= 60 && (
 <button onClick={handleAIReject} className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-4 py-2 text-xs font-semibold text-red-700 transition-all hover:bg-red-100 ">
 <ShieldAlert className="h-3.5 w-3.5" /> AI Reject (High Fraud Risk)
 </button>
 )}
 </motion.div>
 )}

 {/* Update Status */}
 <div className="border-t border-slate-100 pt-4 ">
 <label className="mb-1.5 block text-sm font-medium text-slate-700 ">Update Status</label>
 <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="field">
 {["Submitted", "Under Review", "Approved", "Rejected", "Paid"].map((s) => <option key={s} value={s}>{s}</option>)}
 </select>
 </div>

 <div>
 <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-slate-700 ">
 <MessageSquare className="h-3.5 w-3.5" /> Admin Remarks
 </label>
 <textarea value={remarks} onChange={(e) => setRemarks(e.target.value)} rows={3} placeholder="Add notes or reason for decision..." className="field" />
 </div>

 <div className="flex flex-wrap justify-end gap-3">
 {selected.requiresFraudReview && (
 <>
 <button onClick={() => handleFraudDecision("clear")} disabled={updating} className="rounded-xl border border-emerald-300 px-4 py-2.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-50 ">
 <CheckCircle2 className="mr-1.5 inline h-4 w-4" /> Clear Fraud
 </button>
 <button onClick={() => handleFraudDecision("reject")} disabled={updating} className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-700 transition-all hover:bg-red-50 ">
 <XCircle className="mr-1.5 inline h-4 w-4" /> Reject Fraud
 </button>
 </>
 )}
 <button onClick={() => setSelected(null)} className="btn-ghost">Cancel</button>
 <button onClick={handleUpdate} disabled={updating} className="btn-primary">
 <Send className="h-4 w-4" /> {updating ? "Updating..." : "Update Claim"}
 </button>
 </div>
 </div>
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}
