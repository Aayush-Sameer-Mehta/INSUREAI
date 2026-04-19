import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Shield,
  Search,
  Plus,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Star,
  AlertTriangle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { deletePolicy, getAdminPolicies } from "../../services/adminService";
import { formatCurrency } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.04 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 28 },
  },
};

const CATEGORIES = [
  "All",
  "health",
  "life",
  "car",
  "travel",
  "home",
  "business",
  "personal_accident",
  "group",
];

const CATEGORY_LABEL = {
  health: "Health",
  life: "Life",
  car: "Car",
  travel: "Travel",
  home: "Home",
  business: "Business",
  personal_accident: "Personal Accident",
  group: "Group",
};

const PAGE_SIZE = 10;

export default function AdminPolicies() {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingError, setLoadingError] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [page, setPage] = useState(1);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deletingId, setDeletingId] = useState("");

  const debouncedSearch = useDebounce(searchInput, 250);

  useEffect(() => {
    let cancelled = false;

    async function loadPolicies() {
      setLoading(true);
      setLoadingError("");
      try {
        const payload = await getAdminPolicies();
        if (!cancelled) {
          setPolicies(Array.isArray(payload) ? payload : []);
        }
      } catch {
        if (!cancelled) {
          setLoadingError("Failed to load policies. Please refresh.");
          toast.error("Failed to load policies");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPolicies();

    return () => {
      cancelled = true;
    };
  }, []);

  const filteredPolicies = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return policies.filter((policy) => {
      const matchesSearch =
        !normalizedSearch ||
        policy?.name?.toLowerCase().includes(normalizedSearch) ||
        policy?.company?.toLowerCase().includes(normalizedSearch);
      const matchesCategory =
        categoryFilter === "All" || policy?.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [policies, debouncedSearch, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPolicies.length / PAGE_SIZE));
  const paginated = filteredPolicies.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE,
  );

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, categoryFilter]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const handleDelete = async (policyId) => {
    if (!policyId || deletingId) return;

    setDeletingId(policyId);
    try {
      await deletePolicy(policyId);
      setPolicies((prev) => prev.filter((policy) => policy._id !== policyId));
      toast.success("Policy deleted");
      setConfirmDelete(null);
    } catch (error) {
      toast.error(error?.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <motion.div
      initial="visible"
      animate="visible"
      variants={containerVariants}
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="section-title flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-inner">
              <Shield className="h-5 w-5 text-white" />
            </div>
            Policy Management
          </h1>
          <p className="section-subtitle mt-1">
            {filteredPolicies.length} total policies available
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/policies/new")}
          className="btn-primary"
        >
          <Plus className="h-4 w-4" /> New Policy
        </button>
      </motion.div>

      <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or company..."
            className="glass-input !pl-10"
            aria-label="Search policies"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setCategoryFilter(category)}
              className={`rounded-xl px-3 py-2 text-xs font-medium capitalize transition-all ${
                categoryFilter === category
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/25"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
              type="button"
            >
              {category === "All" ? "All" : CATEGORY_LABEL[category] || category}
            </button>
          ))}
        </div>
      </motion.div>

      {loadingError && (
        <motion.div
          variants={itemVariants}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {loadingError}
        </motion.div>
      )}

      {loading ? (
        <div className="panel p-0 overflow-hidden">
          {[...Array(5)].map((_, index) => (
            <div
              key={index}
              className="flex gap-4 border-b border-slate-100 px-6 py-4"
            >
              <div className="flex-1 space-y-2">
                <div className="skeleton h-4 w-40" />
                <div className="skeleton h-3 w-24" />
              </div>
              <div className="skeleton h-6 w-16 rounded-full" />
            </div>
          ))}
        </div>
      ) : (
        <motion.div variants={itemVariants} className="panel-soft overflow-hidden p-0 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/10 pointer-events-none" />
          <div className="relative overflow-x-auto scrollbar-hide">
            <table className="data-table min-w-[940px]">
              <thead>
                <tr>
                  <th>Policy</th>
                  <th>Company</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Coverage</th>
                  <th>Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((policy) => (
                  <tr key={policy._id}>
                    <td>
                      <span className="font-semibold text-slate-900">{policy?.name || "Untitled policy"}</span>
                    </td>
                    <td className="text-slate-500">{policy?.company || "Unknown insurer"}</td>
                    <td>
                      <span className="badge badge-info capitalize">
                        {CATEGORY_LABEL[policy?.category] || policy?.category || "NA"}
                      </span>
                    </td>
                    <td className="font-medium text-slate-900">
                      {formatCurrency(policy?.price || 0)}
                    </td>
                    <td className="text-slate-500">
                      {formatCurrency(policy?.coverage || 0)}
                    </td>
                    <td>
                      <div className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">
                          {Number(policy?.ratingAverage || 0).toFixed(1)}
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => navigate(`/admin/policies/${policy._id}/edit`)}
                          className="rounded-lg bg-primary-50 p-2 text-primary-700 transition hover:bg-primary-100"
                          type="button"
                          aria-label={`Edit ${policy?.name || "policy"}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(policy)}
                          className="rounded-lg bg-red-50 p-2 text-red-700 transition hover:bg-red-100"
                          type="button"
                          aria-label={`Delete ${policy?.name || "policy"}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginated.length === 0 && (
                  <tr>
                    <td colSpan={7} className="!py-12 text-center">
                      <Shield className="mx-auto mb-3 h-8 w-8 text-slate-300" />
                      <p className="text-sm text-slate-400">No policies found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {filteredPolicies.length > PAGE_SIZE && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-6 py-3">
              <span className="text-xs text-slate-500">
                Page {page} of {totalPages} · {filteredPolicies.length} total
              </span>
              <div className="flex gap-1.5">
                <button
                  onClick={() => setPage((current) => Math.max(1, current - 1))}
                  disabled={page === 1}
                  className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40"
                  type="button"
                  aria-label="Previous page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  disabled={page === totalPages}
                  className="rounded-lg bg-slate-100 p-2 text-slate-600 transition hover:bg-slate-200 disabled:opacity-40"
                  type="button"
                  aria-label="Next page"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      <AnimatePresence>
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="modal-content w-full max-w-sm"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="flex flex-col items-center text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <h3 className="mt-4 text-lg font-bold text-slate-900">Delete Policy?</h3>
                <p className="mt-2 text-sm text-slate-500">
                  This will permanently delete <strong>{confirmDelete?.name}</strong>. This action
                  cannot be undone.
                </p>
                <div className="mt-6 flex gap-3">
                  <button onClick={() => setConfirmDelete(null)} className="btn-ghost" type="button">
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDelete(confirmDelete?._id)}
                    disabled={deletingId === confirmDelete?._id}
                    className="rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-red-500/25 transition hover:bg-red-700 disabled:opacity-60"
                    type="button"
                  >
                    {deletingId === confirmDelete?._id ? "Deleting..." : "Delete"}
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
