import { useDeferredValue, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, Filter, Sparkles, AlertCircle, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { fetchPoliciesPaginated as fetchPoliciesApi } from "../../services/policyService";
import Loader from "../../components/Loader";
import PolicyCard from "../../components/PolicyCard";
import PolicyCardSkeleton from "../../components/PolicyCardSkeleton";
import { useDebounce } from "../../hooks/useDebounce";
import { Input, Select, PageHeader, EmptyState } from "../../components/common";
import CategorySidebar from "../../components/CategorySidebar";
import BreadcrumbNavigation from "../../components/BreadcrumbNavigation";
import { POLICY_HIERARCHY, getInheritedBackendCategory } from "../../utils/policyHierarchy";

const ITEMS_PER_PAGE = 12;

export default function Policies() {
 const prefersReducedMotion = useReducedMotion();
 const [searchParams, setSearchParams] = useSearchParams();
 const [policies, setPolicies] = useState([]);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState("");
 const [drawerOpen, setDrawerOpen] = useState(false);

 // Pagination state
 const [page, setPage] = useState(1);
 const [totalPages, setTotalPages] = useState(1);

 // Filters state
 const initialCategory = searchParams.get("category") || "all";
 const [activeCategory, setActiveCategory] = useState(initialCategory);
 const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
 const [sortBy, setSortBy] = useState("recommended");

 const debouncedSearch = useDebounce(searchQuery, 300);
 const deferredSearch = useDeferredValue(debouncedSearch);

 const fetchPolicies = async () => {
 try {
 setLoading(true);
 setError("");

 const backendCat = activeCategory !== "all" 
 ? getInheritedBackendCategory(POLICY_HIERARCHY, activeCategory) 
 : undefined;

 const params = { 
 status: "Published", 
 page, 
 limit: ITEMS_PER_PAGE 
 };

 if (backendCat && backendCat !== "all") params.category = backendCat;
 if (deferredSearch) params.search = deferredSearch;
 if (sortBy !== "recommended") params.sort = sortBy;

 const { policies: data, totalPages: pages } = await fetchPoliciesApi(params);
 setPolicies(data || []);
 setTotalPages(pages || 1);
 } catch (err) {
 setError(err?.message || "Failed to load policies");
 } finally {
 setLoading(false);
 }
 };

 useEffect(() => {
 fetchPolicies();
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [page, activeCategory, deferredSearch, sortBy]);

 // Update URL params when filters change
 useEffect(() => {
 const params = new URLSearchParams();
 if (activeCategory !== "all") params.set("category", activeCategory);
 if (debouncedSearch) params.set("search", debouncedSearch);
 if (sortBy !== "recommended") params.set("sort", sortBy);
 setSearchParams(params, { replace: true });
 
 // Only reset page if it's not the initial state load
 if (page !== 1) setPage(1); 
 // eslint-disable-next-line react-hooks/exhaustive-deps
 }, [activeCategory, debouncedSearch, sortBy, setSearchParams]);

 // Close drawer when category changes (user selected from mobile sidebar)
 useEffect(() => {
 setDrawerOpen(false);
 }, [activeCategory]);

 // Lock body scroll when drawer open
 useEffect(() => {
 if (drawerOpen) {
 document.body.style.overflow = "hidden";
 } else {
 document.body.style.overflow = "";
 }
 return () => { document.body.style.overflow = ""; };
 }, [drawerOpen]);

 if (error) {
 return (
 <div className="page-shell">
 <EmptyState
 icon={AlertCircle}
 title="Error loading policies"
 description={error}
 actionLabel="Try again"
 onAction={fetchPolicies}
 actionVariant="primary"
 />
 </div>
 );
 }

 return (
 <div className="page-shell">
 <BreadcrumbNavigation activeId={activeCategory} setActiveId={setActiveCategory} />

 <div className="flex flex-col lg:flex-row lg:gap-8 lg:items-start">
 {/* ─── Desktop Sidebar ──────────────────────── */}
 <div className="hidden lg:block lg:sticky lg:top-24 lg:h-[calc(100vh-8rem)] lg:overflow-y-auto lg:w-72 lg:shrink-0 lg:z-40 lg:pr-2">
 <CategorySidebar activeId={activeCategory} setActiveId={setActiveCategory} />
 </div>

 {/* ─── Mobile Sidebar Drawer ────────────────── */}
 <AnimatePresence>
 {drawerOpen && (
 <>
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 transition={{ duration: 0.2 }}
 className="drawer-backdrop lg:hidden"
 onClick={() => setDrawerOpen(false)}
 />
 <motion.div
 initial={{ x: "-100%" }}
 animate={{ x: 0 }}
 exit={{ x: "-100%" }}
 transition={{ type: "spring", stiffness: 400, damping: 40 }}
 className="fixed left-0 top-0 z-50 flex h-full w-80 max-w-[85vw] flex-col bg-white shadow-2xl lg:hidden "
 >
 <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 ">
 <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900 ">
 <SlidersHorizontal className="h-4 w-4 text-indigo-500" />
 Filter Policies
 </h3>
 <button
 type="button"
 onClick={() => setDrawerOpen(false)}
 className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 "
 aria-label="Close filters"
 >
 <X className="h-5 w-5" />
 </button>
 </div>
 <div className="flex-1 overflow-y-auto p-4">
 <CategorySidebar activeId={activeCategory} setActiveId={setActiveCategory} />
 </div>
 </motion.div>
 </>
 )}
 </AnimatePresence>

 {/* ─── Main content ─────────────────────────── */}
 <div className="flex-1 min-w-0 w-full">
 <section className="mb-6 rounded-xl sm:rounded-2xl border border-slate-200/60 bg-white/60 p-4 sm:p-6 shadow-sm backdrop-blur-xl ">
 <PageHeader
 title="Explore Policies"
 subtitle="Find the perfect coverage tailored to your hierarchical needs."
 icon={Sparkles}
 className="mb-4 sm:mb-6"
 />

 <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
 <div className="flex gap-2 w-full md:w-auto">
 <button
 type="button"
 onClick={() => setDrawerOpen(true)}
 className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 lg:hidden "
 aria-label="Open category filters"
 >
 <SlidersHorizontal className="h-4 w-4" />
 </button>
 <Input
 icon={Search}
 placeholder="Search policies..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full md:w-80 lg:w-96"
 />
 </div>

 <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs sm:text-sm text-slate-500">
 <Filter className="h-4 w-4" />
 <span className="hidden sm:inline">Sort:</span>
 <Select
 value={sortBy}
 onChange={(e) => setSortBy(e.target.value)}
 className="w-48 bg-white "
 >
 <option value="recommended">Recommended Picks</option>
 <option value="price-asc">Premium: Low to High</option>
 <option value="price-desc">Premium: High to Low</option>
 <option value="coverage-desc">Highest Coverage</option>
 </Select>
 </div>
 </div>
 </section>

 {/* Grid */}
 {loading ? (
 <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
 {Array.from({ length: ITEMS_PER_PAGE }).map((_, i) => (
 <PolicyCardSkeleton key={i} />
 ))}
 </div>
 ) : policies.length === 0 ? (
 <EmptyState
 icon={Search}
 title="No policies found"
 description={`We couldn't find any policies matching your current hierarchy or filters.`}
 actionLabel="Clear filters"
 onAction={() => {
 setSearchQuery("");
 setActiveCategory("all");
 setSortBy("recommended");
 }}
 actionVariant="ghost"
 />
 ) : (
 <AnimatePresence mode="popLayout">
 <motion.div
 key={`${activeCategory}-${debouncedSearch}-${sortBy}-${page}`}
 initial={prefersReducedMotion ? false : { opacity: 0, y: 12 }}
 animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
 exit={prefersReducedMotion ? undefined : { opacity: 0 }}
 transition={prefersReducedMotion ? undefined : { duration: 0.2 }}
 className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4"
 >
 {policies.map((policy, idx) => (
 <motion.div
 key={policy.id}
 initial={prefersReducedMotion ? false : { opacity: 0, y: 8 }}
 animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
 transition={prefersReducedMotion ? undefined : { delay: idx * 0.03, duration: 0.18 }}
 >
 <PolicyCard policy={policy} />
 </motion.div>
 ))}
 </motion.div>
 </AnimatePresence>
 )}

 {/* Pagination Controls */}
 {totalPages > 1 && !loading && (
 <div className="mt-8 flex justify-center">
 <div className="flex flex-wrap shrink-0 items-center justify-center gap-1.5 sm:gap-2 rounded-2xl border border-slate-200 bg-white px-2 py-1.5 shadow-sm ">
 {Array.from({ length: totalPages }).map((_, i) => (
 <button
 key={i}
 onClick={() => {
 setPage(i + 1);
 window.scrollTo({ top: 0, behavior: "smooth" });
 }}
 className={`flex h-9 min-w-9 items-center justify-center rounded-xl text-sm font-semibold transition-all ${
 page === i + 1
 ? "bg-primary-600 text-white shadow-md"
 : "text-slate-600 hover:bg-slate-100 "
 }`}
 >
 {i + 1}
 </button>
 ))}
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
