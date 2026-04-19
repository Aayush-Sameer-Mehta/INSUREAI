import { useCallback, useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { 
 FileText, 
 Search, 
 Download, 
 ArrowRight,
 RefreshCw,
 ShieldCheck, 
 Calendar,
 IndianRupee,
 LayoutGrid,
 List
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../../services/api";
import Loader from "../../components/Loader";
import { formatCurrency } from "../../utils/formatters";
import { useDebounce } from "../../hooks/useDebounce";
import { 
 PageHeader, 
 Input, 
 DataTable, 
 EmptyState, 
 Badge, 
 Card,
 Button
} from "../../components/common";

export default function MyPolicies() {
 const [policies, setPolicies] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchQuery, setSearchQuery] = useState("");
 const [viewMode, setViewMode] = useState("grid"); // "grid" | "table"
 const debouncedSearch = useDebounce(searchQuery, 300);

 const fetchPolicies = useCallback(async () => {
 try {
 setLoading(true);
 const { data } = await api.get("/users/profile");
 let purchases = data.purchasedPolicies || [];
 
 if (debouncedSearch) {
 const q = debouncedSearch.toLowerCase();
 purchases = purchases.filter(p => 
 p.policy?.name?.toLowerCase().includes(q) ||
 p.policy?.category?.toLowerCase().includes(q)
 );
 }
 
 setPolicies(purchases);
 } catch {
 // Empty state handles the visual error feedback
 setPolicies([]);
 } finally {
 setLoading(false);
 }
 }, [debouncedSearch]);

 useEffect(() => {
 fetchPolicies();
 }, [fetchPolicies]);

 const downloadPdf = async (purchaseId) => {
 try {
 const response = await api.get(`/users/policy-document/${purchaseId}`, {
 responseType: "blob",
 });
 const blob = new Blob([response.data], { type: "application/pdf" });
 const url = URL.createObjectURL(blob);
 const link = document.createElement("a");
 link.href = url;
 link.download = `insureai-policy-${purchaseId}.pdf`;
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 URL.revokeObjectURL(url);
 } catch {
 // Ignore
 }
 };

 // DataTable columns
 const columns = useMemo(() => [
 {
 key: "policy",
 label: "Policy Name",
 render: (_, row) => (
 <div className="flex items-center gap-3">
 <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-50 ">
 <ShieldCheck className="h-4 w-4 text-primary-500" />
 </div>
 <div>
 <p className="font-semibold text-slate-900 ">
 {row.policy?.name || "Unknown Policy"}
 </p>
 <p className="text-[11px] text-slate-500 uppercase tracking-wider mt-0.5">
 {row.policy?.category || "General"}
 </p>
 </div>
 </div>
 )
 },
 {
 key: "amount",
 label: "Premium Paid",
 render: (amount) => (
 <span className="font-medium text-slate-900 ">
 {formatCurrency(amount || 0)}
 </span>
 )
 },
 {
 key: "purchasedAt",
 label: "Date",
 render: (date) => (
 <span className="text-sm text-slate-600 ">
 {new Date(date).toLocaleDateString()}
 </span>
 )
 },
 {
 key: "validTo",
 label: "Status",
 render: (date) => {
 if (!date) return <Badge color="default">Indefinite</Badge>;
 const daysLeft = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
 if (daysLeft < 0) return <Badge color="danger">Expired</Badge>;
 if (daysLeft <= 30) return <Badge color="warning">Expiring Soon ({daysLeft} days)</Badge>;
 return <Badge color="success">Active</Badge>;
 }
 },
 {
 key: "actions",
 label: "",
 sortable: false,
 render: (_, row) => (
 <div className="flex justify-end gap-2">
 {row.policyDocumentPath && (
 <Button
 variant="ghost"
 size="sm"
 icon={Download}
 onClick={() => downloadPdf(row._id)}
 >
 PDF
 </Button>
 )}
 {row.policy?._id && (
 <>
 <Link
 to={`/renewals?purchaseId=${row._id}`}
 className="btn-primary btn-sm"
 >
 Renew
 </Link>
 <Link
 to={`/policies/${row.policy._id}`}
 className="btn-ghost btn-sm"
 >
 Details
 </Link>
 </>
 )}
 </div>
 )
 }
 ], []);

 if (loading && policies.length === 0) return <Loader label="Loading your policies..." />;

 return (
 <div className="page-shell">
 <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
 <PageHeader 
 title="My Purchased Policies" 
 subtitle="Manage your active coverage and documents"
 icon={FileText}
 className="mb-0 border-0 pb-0"
 />
 
 <div className="flex items-center gap-3">
 <Input
 icon={Search}
 placeholder="Search my policies..."
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className="w-full sm:w-64"
 />
 <div className="flex items-center rounded-xl bg-slate-100 p-1 ">
 <button
 onClick={() => setViewMode("grid")}
 className={`rounded-lg p-2 transition-all ${
 viewMode === "grid" 
 ? "bg-white text-primary-600 shadow-sm " 
 : "text-slate-500 hover:text-slate-700 "
 }`}
 >
 <LayoutGrid className="h-4 w-4" />
 </button>
 <button
 onClick={() => setViewMode("table")}
 className={`rounded-lg p-2 transition-all ${
 viewMode === "table" 
 ? "bg-white text-primary-600 shadow-sm " 
 : "text-slate-500 hover:text-slate-700 "
 }`}
 >
 <List className="h-4 w-4" />
 </button>
 </div>
 </div>
 </div>

 {policies.length === 0 ? (
 <Card>
 <EmptyState
 icon={ShieldCheck}
 title={searchQuery ? "No matching policies" : "No active policies"}
 description={searchQuery ? "Try a different search term" : "You haven't purchased any policies yet."}
 actionLabel={!searchQuery ? "Explore Coverage" : ""}
 actionIcon={ShieldCheck}
 onAction={!searchQuery ? () => window.location.href = "/policies" : undefined}
 />
 </Card>
 ) : (
 <AnimatePresence mode="popLayout">
 {viewMode === "table" ? (
 <motion.div
 key="table"
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.2 }}
 >
 <DataTable 
 columns={columns} 
 data={policies} 
 pageSize={10} 
 />
 </motion.div>
 ) : (
 <motion.div
 key="grid"
 initial={{ opacity: 0, scale: 0.98 }}
 animate={{ opacity: 1, scale: 1 }}
 exit={{ opacity: 0, scale: 0.98 }}
 transition={{ duration: 0.2 }}
 className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
 >
 {policies.map((item, idx) => {
 const isExpiring = item.validTo && 
 Math.ceil((new Date(item.validTo) - new Date()) / (1000 * 60 * 60 * 24)) <= 30;

 return (
 <motion.div
 key={item._id}
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: idx * 0.05 }}
 >
 <Card
 variant="interactive"
 className={`relative overflow-hidden ${isExpiring ? 'border-amber-200 ' : ''}`}
 >
 {isExpiring && (
 <div className="absolute top-0 left-0 w-full h-1 bg-amber-400 " />
 )}
 
 <div className="flex items-start justify-between">
 <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-500/20">
 <ShieldCheck className="h-6 w-6" />
 </div>
 <Badge color={isExpiring ? "warning" : "success"} dot>
 {isExpiring ? "Expiring Soon" : "Active"}
 </Badge>
 </div>

 <div className="mt-5">
 <h3 className="font-bold text-slate-900 line-clamp-1 mb-1">
 {item.policy?.name || "Unknown Policy"}
 </h3>
 <p className="text-xs uppercase tracking-wider text-slate-500 font-semibold mb-4">
 {item.policy?.category || "General"}
 </p>
 
 <div className="space-y-3 rounded-xl bg-slate-50 p-4 text-sm">
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5 text-slate-500">
 <Calendar className="h-4 w-4" /> Purchased
 </span>
 <span className="font-medium text-slate-900 ">
 {new Date(item.purchasedAt).toLocaleDateString('en-IN')}
 </span>
 </div>
 
 <div className="flex items-center justify-between">
 <span className="flex items-center gap-1.5 text-slate-500">
 <IndianRupee className="h-4 w-4" /> Premium
 </span>
 <span className="font-medium text-slate-900 ">
 {formatCurrency(item.amount)}
 </span>
 </div>

 {item.validTo && (
 <div className="flex items-center justify-between pt-3 border-t border-slate-200 ">
 <span className="flex items-center gap-1.5 text-slate-500">
 <Calendar className="h-4 w-4" /> Valid Till
 </span>
 <span className={`font-medium ${isExpiring ? 'text-amber-600 ' : 'text-slate-900 '}`}>
 {new Date(item.validTo).toLocaleDateString('en-IN')}
 </span>
 </div>
 )}
 </div>
 </div>

 <div className="mt-6 flex gap-3">
 {item.policyDocumentPath && (
 <Button 
 variant="ghost" 
 size="sm" 
 className="flex-1"
 icon={Download}
 onClick={(e) => { e.stopPropagation(); downloadPdf(item._id); }}
 >
 PDF
 </Button>
 )}
 {item.policy?._id && (
 <Link 
 to={`/renewals?purchaseId=${item._id}`}
 className="btn-primary btn-sm flex-1"
 onClick={(e) => e.stopPropagation()}
 >
 Renew <RefreshCw className="h-3.5 w-3.5 ml-1" />
 </Link>
 )}
 {item.policy?._id && (
 <Link 
 to={`/policies/${item.policy._id}`}
 className="btn-ghost btn-sm flex-1"
 onClick={(e) => e.stopPropagation()}
 >
 Details <ArrowRight className="h-3.5 w-3.5 ml-1" />
 </Link>
 )}
 </div>
 </Card>
 </motion.div>
 );
 })}
 </motion.div>
 )}
 </AnimatePresence>
 )}
 </div>
 );
}
