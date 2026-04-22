import { useEffect, useState, useMemo } from "react";
import {
 Users, Search, Shield, ShieldOff, Eye, X,
 ChevronLeft, ChevronRight, User, Mail, MapPin,
 Calendar, Phone, Briefcase, HeartHandshake, ShieldCheck,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { getAdminUsers, getAdminUser, blockUser, updateUserRole } from "../../services/adminService";
import { normalizeRole } from "../../utils/auth";

const containerVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};
const itemVariants = {
 hidden: { opacity: 0, y: 12 },
 visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } },
};

const ROLES = ["All", "USER", "ADMIN"];
const STATUSES = ["All", "Active", "Blocked"];
const PAGE_SIZE = 10;

export default function AdminUsers() {
 const [users, setUsers] = useState([]);
 const [loading, setLoading] = useState(true);
 const [search, setSearch] = useState("");
 const [roleFilter, setRoleFilter] = useState("All");
 const [statusFilter, setStatusFilter] = useState("All");
 const [page, setPage] = useState(1);
 const [selected, setSelected] = useState(null);
 const [detailLoading, setDetailLoading] = useState(false);
 const [blockReason, setBlockReason] = useState("");
 const [selectedRole, setSelectedRole] = useState("USER");
 const [roleSaving, setRoleSaving] = useState(false);

 const load = () => {
 setLoading(true);
 getAdminUsers()
 .then(setUsers)
 .catch(() => toast.error("Failed to load users"))
 .finally(() => setLoading(false));
 };

 useEffect(() => { load(); }, []);

 const filtered = useMemo(() => {
 return users.filter((u) => {
 const matchesSearch =
 !search ||
 u.fullName?.toLowerCase().includes(search.toLowerCase()) ||
 u.email?.toLowerCase().includes(search.toLowerCase());
 const matchesRole = roleFilter === "All" || normalizeRole(u.role) === roleFilter;
 const matchesStatus =
 statusFilter === "All" ||
 (statusFilter === "Active" && !u.isBlocked) ||
 (statusFilter === "Blocked" && u.isBlocked);
 return matchesSearch && matchesRole && matchesStatus;
 });
 }, [users, search, roleFilter, statusFilter]);

 const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
 const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

 useEffect(() => { setPage(1); }, [search, roleFilter, statusFilter]);

 const openDetail = async (user) => {
 setSelected(user);
 setBlockReason("");
 setSelectedRole(normalizeRole(user.role));
 setDetailLoading(true);
 try {
 const detailed = await getAdminUser(user._id);
 setSelected(detailed);
 setSelectedRole(normalizeRole(detailed.role));
 } catch {
 toast.error("Failed to load full user details");
 } finally {
 setDetailLoading(false);
 }
 };

 const handleBlock = async (userId, blocked) => {
 try {
 await blockUser(userId, blocked, blockReason);
 toast.success(blocked ? "User blocked" : "User unblocked");
 setUsers((prev) =>
 prev.map((u) => (u._id === userId ? { ...u, isBlocked: blocked } : u))
 );
 if (selected?._id === userId) {
 setSelected((prev) => ({ ...prev, isBlocked: blocked }));
 }
 } catch (err) {
 toast.error(err?.response?.data?.message || "Action failed");
 }
 };

 const handleRoleUpdate = async () => {
 if (!selected?._id || selectedRole === normalizeRole(selected.role)) return;

 try {
 setRoleSaving(true);
 const response = await updateUserRole(selected._id, selectedRole);
 const updatedUser = response?.user;

 toast.success(response?.message || "User role updated");
 setUsers((prev) =>
 prev.map((u) => (u._id === updatedUser._id ? { ...u, ...updatedUser } : u))
 );
 setSelected((prev) => ({ ...prev, ...updatedUser }));
 setSelectedRole(normalizeRole(updatedUser.role));
 } catch (err) {
 toast.error(err?.response?.data?.message || "Failed to update role");
 } finally {
 setRoleSaving(false);
 }
 };

 const fmtDate = (d) =>
 d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

 const infoItems = selected ? [
 { icon: Mail, label: "Email", value: selected.email },
 { icon: Phone, label: "Mobile", value: selected.mobileNumber || "—" },
 { icon: MapPin, label: "Location", value: [selected.city, selected.state].filter(Boolean).join(", ") || "—" },
 { icon: Briefcase, label: "Occupation", value: selected.occupation || "—" },
 { icon: HeartHandshake, label: "Marital Status", value: selected.maritalStatus || "—" },
 { icon: Calendar, label: "Date of Birth", value: fmtDate(selected.dateOfBirth) },
 ] : [];

 return (
 <motion.div initial="visible" animate="visible" variants={containerVariants} className="space-y-6">
 <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
 <div>
 <h1 className="section-title flex items-center gap-2">
 <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-secondary-500 to-secondary-700 shadow-inner">
 <Users className="h-5 w-5 text-white" />
 </div>
 User Management
 </h1>
 <p className="section-subtitle mt-1">{filtered.length} users found</p>
 </div>
 </motion.div>

 {/* Summary Cards */}
 <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
 <div className="stat-card">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Users</p>
 <p className="mt-2 text-2xl font-bold text-slate-900 ">{users.length}</p>
 </div>
 <div className="rounded-xl bg-slate-100 p-3 ">
 <Users className="h-5 w-5 text-slate-500" />
 </div>
 </div>
 </div>
 <div className="stat-card">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Admins</p>
 <p className="mt-2 text-2xl font-bold text-secondary-600 ">
 {users.filter((u) => normalizeRole(u.role) === "ADMIN").length}
 </p>
 </div>
 <div className="rounded-xl bg-secondary-50 p-3 ">
 <Shield className="h-5 w-5 text-secondary-500" />
 </div>
 </div>
 </div>
 <div className="stat-card">
 <div className="flex items-start justify-between">
 <div>
 <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blocked</p>
 <p className="mt-2 text-2xl font-bold text-red-600 ">
 {users.filter(u => u.isBlocked).length}
 </p>
 </div>
 <div className="rounded-xl bg-red-50 p-3 ">
 <ShieldOff className="h-5 w-5 text-red-500" />
 </div>
 </div>
 </div>
 </motion.div>

 {/* Filters */}
 <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
 <div className="relative flex-1 min-w-[200px] max-w-sm">
 <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
 <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users by name or email..." className="glass-input !pl-10" />
 </div>
 
 <div className="flex gap-2">
 {ROLES.map((r) => (
 <button
 key={r}
 onClick={() => setRoleFilter(r)}
 className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
 roleFilter === r
 ? "bg-secondary-600 text-white shadow-lg shadow-secondary-600/25"
 : "bg-slate-100 text-slate-600 hover:bg-slate-200 "
 }`}
 >
 {r}
 </button>
 ))}
 </div>

 <div className="flex gap-2">
 {STATUSES.map((s) => (
 <button
 key={s}
 onClick={() => setStatusFilter(s)}
 className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${
 statusFilter === s
 ? "bg-slate-800 text-white "
 : "bg-slate-100 text-slate-600 hover:bg-slate-200 "
 }`}
 >
 {s}
 </button>
 ))}
 </div>
 </motion.div>

 {/* List */}
 {loading ? (
 <div className="panel p-0 overflow-hidden">
 {[...Array(5)].map((_, i) => (
 <div key={i} className="flex gap-4 border-b border-slate-100 px-6 py-4 ">
 <div className="flex-1 space-y-2"><div className="skeleton h-4 w-32" /><div className="skeleton h-3 w-48" /></div>
 <div className="skeleton h-6 w-20 rounded-full" />
 </div>
 ))}
 </div>
 ) : (
 <motion.div variants={itemVariants} className="panel-soft p-0 relative overflow-hidden">
 <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
 <div className="relative overflow-x-auto">
 <table className="data-table">
 <thead>
 <tr>
 <th>User</th>
 <th>Role</th>
 <th>Status</th>
 <th>Joined</th>
 <th>Action</th>
 </tr>
 </thead>
 <tbody>
 {paginated.map((user) => (
 <tr key={user._id}>
 <td>
 <div className="flex items-center gap-3">
 <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary-500 to-secondary-700 text-xs font-bold text-white shadow-sm">
 {user.fullName?.charAt(0)?.toUpperCase()}
 </div>
 <div>
 <p className="text-sm font-bold text-slate-900 ">{user.fullName}</p>
 <p className="text-xs text-slate-500 ">{user.email}</p>
 </div>
 </div>
 </td>
 <td>
 <span className={`badge ${normalizeRole(user.role) === "ADMIN" ? "badge-info" : "bg-slate-100 text-slate-600 "}`}>
 {normalizeRole(user.role)}
 </span>
 </td>
 <td>
 <span className={`badge ${user.isBlocked ? "badge-danger" : "badge-success"}`}>
 {user.isBlocked ? "Blocked" : "Active"}
 </span>
 </td>
 <td className="text-slate-500 ">{fmtDate(user.createdAt)}</td>
 <td>
 <button onClick={() => openDetail(user)} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 ">
 <Eye className="h-4 w-4" />
 </button>
 </td>
 </tr>
 ))}
 {paginated.length === 0 && (
 <tr>
 <td colSpan={5} className="!py-12 text-center">
 <Users className="mx-auto mb-3 h-8 w-8 text-slate-300 " />
 <p className="text-sm text-slate-400">No users found</p>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 {totalPages > 1 && (
 <div className="relative flex items-center justify-between border-t border-slate-100/50 px-6 py-3 ">
 <span className="text-xs text-slate-500">Page {page} of {totalPages}</span>
 <div className="flex gap-1.5">
 <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-ghost !p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4"/></button>
 <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="btn-ghost !p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4"/></button>
 </div>
 </div>
 )}
 </motion.div>
 )}

 {/* Modal */}
 <AnimatePresence>
 {selected && (
 <div className="modal-overlay" onClick={() => setSelected(null)}>
 <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
 className="modal-content w-full max-w-4xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
 <div className="flex items-center justify-between mb-5">
 <h3 className="text-lg font-bold">User Details</h3>
 <button onClick={() => setSelected(null)} className="btn-ghost !p-1.5"><X className="h-5 w-5" /></button>
 </div>
 
 {detailLoading ? (
 <div className="space-y-4 py-4">
 <div className="skeleton h-16 w-full rounded-2xl" />
 <div className="skeleton h-24 w-full rounded-2xl" />
 </div>
 ) : (
 <div className="space-y-5">
 <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4 ">
 <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-secondary-500 to-secondary-700 text-lg font-bold text-white shadow-md">
 {selected.fullName?.charAt(0)?.toUpperCase()}
 </div>
 <div>
 <h4 className="font-bold text-slate-900 ">{selected.fullName}</h4>
 <p className="text-sm text-slate-500 ">{selected.email}</p>
 </div>
 <div className="ml-auto">
 <span className={`badge ${selected.isBlocked ? "badge-danger" : "badge-success"}`}>
 {selected.isBlocked ? "Blocked" : "Active"}
 </span>
 </div>
 </div>

 <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1.1fr_0.9fr]">
 <div className="space-y-5">
 <div className="rounded-2xl border border-slate-100 p-4 ">
 <h4 className="mb-3 text-sm font-bold text-slate-900 ">Profile Overview</h4>
 <div className="grid gap-3 sm:grid-cols-2">
 {infoItems.map(({ icon: Icon, label, value }) => (
 <div key={label} className="rounded-xl bg-slate-50 p-3 ">
 <div className="flex items-center gap-1.5 text-xs text-slate-500">
 <Icon className="h-3.5 w-3.5" />
 {label}
 </div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">{value}</p>
 </div>
 ))}
 </div>
 </div>

 <div className="rounded-2xl border border-slate-100 p-4 ">
 <h4 className="mb-3 text-sm font-bold text-slate-900 ">Address & Verification</h4>
 <div className="grid gap-3 sm:grid-cols-2">
 <div className="rounded-xl bg-slate-50 p-3 ">
 <div className="text-xs text-slate-500">Billing Address</div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">
 {selected.addressInfo?.billingAddress || "—"}
 </p>
 </div>
 <div className="rounded-xl bg-slate-50 p-3 ">
 <div className="text-xs text-slate-500">Permanent Address</div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">
 {selected.addressInfo?.permanentAddress || "—"}
 </p>
 </div>
 <div className="rounded-xl bg-slate-50 p-3 ">
 <div className="text-xs text-slate-500">KYC Status</div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">
 {selected.kycDetails?.isKycVerified ? "Verified" : "Not Verified"}
 </p>
 </div>
 <div className="rounded-xl bg-slate-50 p-3 ">
 <div className="text-xs text-slate-500">PAN Number</div>
 <p className="mt-1 text-sm font-medium text-slate-900 ">
 {selected.kycDetails?.panCardNumber || "—"}
 </p>
 </div>
 </div>
 </div>

 <div className="rounded-2xl border border-slate-100 p-4 ">
 <h4 className="mb-3 text-sm font-bold text-slate-900 ">Purchased Policies</h4>
 {selected.purchasedPolicies?.length ? (
 <div className="space-y-3">
 {selected.purchasedPolicies.map((purchase) => (
 <div key={purchase._id} className="rounded-xl border border-slate-100 p-3 ">
 <div className="flex items-start justify-between gap-3">
 <div>
 <p className="font-semibold text-slate-900 ">
 {purchase.policy?.name || "Policy"}
 </p>
 <p className="text-xs text-slate-500 ">
 {purchase.policy?.company || "Unknown company"} • {purchase.policy?.category || "Uncategorized"}
 </p>
 </div>
 <span className="badge badge-info">{purchase.paymentStatus || "Paid"}</span>
 </div>
 <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 ">
 <span>Amount: ₹{Number(purchase.amount || 0).toLocaleString("en-IN")}</span>
 <span>Purchased: {fmtDate(purchase.purchasedAt)}</span>
 <span>Valid till: {fmtDate(purchase.validTo)}</span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-slate-500 ">No purchased policies yet.</p>
 )}
 </div>
 </div>

 <div className="space-y-5">
 <div className="rounded-xl border border-slate-100 p-3 ">
 <div className="flex items-center gap-1.5 text-xs text-slate-500"><User className="h-3.5 w-3.5"/> Role</div>
 <div className="mt-2 flex gap-2">
 <select
 value={selectedRole}
 onChange={(e) => setSelectedRole(e.target.value)}
 className="field !py-2"
 disabled={roleSaving}
 >
 {ROLES.slice(1).map((role) => (
 <option key={role} value={role}>
 {role}
 </option>
 ))}
 </select>
 <button
 onClick={handleRoleUpdate}
 disabled={roleSaving || selectedRole === normalizeRole(selected.role)}
 className="rounded-lg bg-secondary-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-secondary-700 disabled:cursor-not-allowed disabled:opacity-50"
 >
 {roleSaving ? "Saving..." : "Save"}
 </button>
 </div>
 </div>
 <div className="rounded-xl border border-slate-100 p-3 ">
 <div className="flex items-center gap-1.5 text-xs text-slate-500"><Calendar className="h-3.5 w-3.5"/> Joined</div>
 <p className="mt-1 font-medium">{fmtDate(selected.createdAt)}</p>
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div className="rounded-xl border border-slate-100 p-3 ">
 <div className="text-xs text-slate-500">Dependents</div>
 <p className="mt-1 text-lg font-bold">{selected.dependents?.length || 0}</p>
 </div>
 <div className="rounded-xl border border-slate-100 p-3 ">
 <div className="text-xs text-slate-500">Policies Bought</div>
 <p className="mt-1 text-lg font-bold">{selected.purchasedPolicies?.length || 0}</p>
 </div>
 </div>

 <div className="rounded-2xl border border-slate-100 p-4 ">
 <h4 className="mb-3 text-sm font-bold text-slate-900 ">Dependents</h4>
 {selected.dependents?.length ? (
 <div className="space-y-2">
 {selected.dependents.map((dependent, index) => (
 <div key={`${dependent.name}-${index}`} className="rounded-xl bg-slate-50 p-3 ">
 <div className="flex items-center justify-between gap-3">
 <div>
 <p className="text-sm font-semibold text-slate-900 ">{dependent.name}</p>
 <p className="text-xs text-slate-500 ">
 {dependent.relationship} • {dependent.gender || "—"}
 </p>
 </div>
 <span className={`badge ${dependent.isCovered ? "badge-success" : "bg-slate-100 text-slate-600 "}`}>
 {dependent.isCovered ? "Covered" : "Not Covered"}
 </span>
 </div>
 </div>
 ))}
 </div>
 ) : (
 <p className="text-sm text-slate-500 ">No dependents added.</p>
 )}
 </div>

 {selected.kycDetails?.isKycVerified && (
 <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 ">
 <div className="flex items-center gap-2 text-sm font-bold text-emerald-800 ">
 <ShieldCheck className="h-4 w-4" />
 KYC Verified
 </div>
 <p className="mt-1 text-xs text-emerald-700 ">
 Verification date: {fmtDate(selected.kyc_verification_date)}
 </p>
 </div>
 )}

 {normalizeRole(selected.role) !== "ADMIN" && (
 <div className="rounded-xl bg-red-50 p-4 border border-red-100 ">
 <h4 className="mb-2 text-sm font-bold text-red-800 ">
 {selected.isBlocked ? "Unblock User" : "Block User"}
 </h4>
 {!selected.isBlocked && (
 <input 
 type="text" 
 placeholder="Reason for blocking..." 
 value={blockReason} 
 onChange={(e) => setBlockReason(e.target.value)} 
 className="field mb-3 !bg-white " 
 />
 )}
 <button 
 onClick={() => handleBlock(selected._id, !selected.isBlocked)} 
 className={`w-full rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all ${
 selected.isBlocked ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
 }`}
 >
 {selected.isBlocked ? "Unblock User" : "Block User"}
 </button>
 </div>
 )}
 </div>
 </div>
 </div>
 )}
 </motion.div>
 </div>
 )}
 </AnimatePresence>
 </motion.div>
 );
}
