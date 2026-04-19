import { useEffect, useState, useMemo } from "react";
import {
    CreditCard, Search, ChevronLeft, ChevronRight, IndianRupee,
    Calendar, Filter,
} from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { getAdminPayments } from "../../services/adminService";
import { formatCurrency } from "../../utils/formatters";

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.04 } } };
const itemVariants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 28 } } };

const PAGE_SIZE = 12;
const PAYMENT_STATUSES = ["All", "Paid", "Pending", "Failed"];

function formatMethod(method) {
    if (!method) return "—";

    const normalized = String(method).trim().toLowerCase();
    const labels = {
        upi: "UPI",
        card: "Card",
        netbanking: "Net Banking",
        wallet: "Wallet",
        cash: "Cash",
        bank_transfer: "Bank Transfer",
    };

    return labels[normalized] || normalized.replace(/_/g, " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

function normalizePayment(payment) {
    const user = payment.user || payment.user_id || null;
    const policy = payment.policy || payment.policy_id || null;
    const rawTransactionId = payment.transactionId || payment.paymentId || payment.payment_reference || payment._id;
    const rawStatus = payment.paymentStatus || payment.payment_status || "Pending";
    const status = String(rawStatus).trim();

    return {
        ...payment,
        user,
        policy,
        transactionId: rawTransactionId ? String(rawTransactionId) : "—",
        paymentStatus: status ? status.charAt(0).toUpperCase() + status.slice(1).toLowerCase() : "Pending",
        paymentMethod: formatMethod(payment.paymentMethod || payment.payment_method),
        amount: Number(payment.amount ?? payment.premium_amount ?? 0),
        purchasedAt: payment.purchasedAt || payment.createdAt || payment.updatedAt || null,
    };
}

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [page, setPage] = useState(1);

    useEffect(() => {
        let active = true;

        async function loadPayments() {
            try {
                const data = await getAdminPayments();
                if (active) {
                    const list = Array.isArray(data) ? data : [];
                    setPayments(list.map(normalizePayment));
                }
            } catch {
                toast.error("Failed to load payments");
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        }

        loadPayments();

        return () => {
            active = false;
        };
    }, []);

    const filtered = useMemo(() => {
        return payments.filter((p) => {
            const matchesSearch =
                !search ||
                p.user?.fullName?.toLowerCase().includes(search.toLowerCase()) ||
                p.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
                p.transactionId?.toLowerCase().includes(search.toLowerCase());
            const matchesStatus = statusFilter === "All" || p.paymentStatus === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [payments, search, statusFilter]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const currentPage = Math.min(page, totalPages);
    const paginated = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);
    const totalRevenue = filtered.reduce((sum, p) => sum + (p.amount || 0), 0);

    const fmtDate = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

    return (
        <motion.div initial="visible" animate="visible" variants={containerVariants} className="space-y-6">
            {/* Header */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="section-title flex items-center gap-2">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-inner">
                            <CreditCard className="h-5 w-5 text-white" />
                        </div>
                        Payment Management
                    </h1>
                    <p className="section-subtitle mt-1">{filtered.length} transactions</p>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-3">
                <div className="stat-card">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Revenue</p>
                            <p className="mt-2 text-2xl font-bold text-emerald-600 ">{formatCurrency(totalRevenue)}</p>
                        </div>
                        <div className="rounded-xl bg-emerald-50 p-3 ">
                            <IndianRupee className="h-5 w-5 text-emerald-500" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Transactions</p>
                            <p className="mt-2 text-2xl font-bold text-primary-600 ">{filtered.length}</p>
                        </div>
                        <div className="rounded-xl bg-primary-50 p-3 ">
                            <CreditCard className="h-5 w-5 text-primary-500" />
                        </div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Avg. Transaction</p>
                            <p className="mt-2 text-2xl font-bold text-violet-600 ">
                                {formatCurrency(filtered.length > 0 ? totalRevenue / filtered.length : 0)}
                            </p>
                        </div>
                        <div className="rounded-xl bg-violet-50 p-3 ">
                            <Calendar className="h-5 w-5 text-violet-500" />
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Filters */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            setPage(1);
                        }}
                        placeholder="Search by user, email, or transaction ID..."
                        className="glass-input !pl-10"
                    />
                </div>
                <div className="flex gap-2">
                    {PAYMENT_STATUSES.map((s) => (
                        <button
                            key={s}
                            onClick={() => {
                                setStatusFilter(s);
                                setPage(1);
                            }}
                            className={`rounded-xl px-3 py-2 text-xs font-medium transition-all ${statusFilter === s
                                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 "
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <span className="text-xs text-slate-500 ml-auto"><Filter className="inline h-3.5 w-3.5 mr-1" />{filtered.length} results</span>
            </motion.div>

            {/* Table */}
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
                <motion.div variants={itemVariants} className="panel-soft overflow-hidden p-0 relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
                    <div className="relative overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Transaction ID</th>
                                    <th>User</th>
                                    <th>Policy</th>
                                    <th>Amount</th>
                                    <th>Method</th>
                                    <th>Status</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginated.map((payment) => (
                                    <tr key={payment._id}>
                                        <td className="font-mono text-xs text-primary-600 ">{payment.transactionId || "—"}</td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-primary-700 text-[10px] font-bold text-white">
                                                    {payment.user?.fullName?.charAt(0)?.toUpperCase() || "U"}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-900 ">{payment.user?.fullName || "—"}</p>
                                                    <p className="text-xs text-slate-400">{payment.user?.email || ""}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="text-slate-600 ">{payment.policy?.name || "—"}</td>
                                        <td className="font-semibold text-slate-900 ">{formatCurrency(payment.amount)}</td>
                                        <td>
                                            <span className="badge badge-info">{payment.paymentMethod}</span>
                                        </td>
                                        <td>
                                            <span className={`badge ${payment.paymentStatus === "Paid" ? "badge-success" : payment.paymentStatus === "Failed" ? "badge-danger" : payment.paymentStatus === "Pending" ? "badge-warning" : "badge-info"}`}>
                                                {payment.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="text-slate-500 ">{fmtDate(payment.purchasedAt)}</td>
                                    </tr>
                                ))}
                                {paginated.length === 0 && (
                                    <tr><td colSpan={7} className="!py-12 text-center">
                                        <CreditCard className="mx-auto mb-3 h-8 w-8 text-slate-300 " />
                                        <p className="text-sm text-slate-400">No payments found</p>
                                    </td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3 ">
                            <span className="text-xs text-slate-500">Page {currentPage} of {totalPages}</span>
                            <div className="flex gap-1.5">
                                <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 ">
                                    <ChevronLeft className="h-4 w-4" />
                                </button>
                                <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40 ">
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </motion.div>
            )}
        </motion.div>
    );
}
