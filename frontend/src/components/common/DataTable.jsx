import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import Skeleton from "./Skeleton";
import EmptyState from "./EmptyState";

export default function DataTable({
 columns,
 data,
 loading = false,
 emptyTitle = "No data found",
 emptyDescription = "",
 emptyIcon,
 pageSize = 10,
 sortable = true,
 className = "",
 onRowClick,
}) {
 const [sortKey, setSortKey] = useState(null);
 const [sortDir, setSortDir] = useState("asc");
 const [page, setPage] = useState(0);

 const toggleSort = (key) => {
 if (!sortable) return;
 if (sortKey === key) {
 setSortDir((d) => (d === "asc" ? "desc" : "asc"));
 } else {
 setSortKey(key);
 setSortDir("asc");
 }
 setPage(0);
 };

 const sortedData = useMemo(() => {
 if (!sortKey) return data;
 const sorted = [...data].sort((a, b) => {
 const aVal = a[sortKey];
 const bVal = b[sortKey];
 if (aVal == null) return 1;
 if (bVal == null) return -1;
 if (typeof aVal === "number" && typeof bVal === "number") {
 return sortDir === "asc" ? aVal - bVal : bVal - aVal;
 }
 return sortDir === "asc"
 ? String(aVal).localeCompare(String(bVal))
 : String(bVal).localeCompare(String(aVal));
 });
 return sorted;
 }, [data, sortKey, sortDir]);

 const totalPages = Math.ceil(sortedData.length / pageSize);
 const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
 const paginatedData = sortedData.slice(
 currentPage * pageSize,
 (currentPage + 1) * pageSize
 );

 if (loading) {
 return (
 <div className="panel overflow-hidden">
 <div className="p-6">
 <Skeleton variant="table-row" count={5} />
 </div>
 </div>
 );
 }

 if (!data || data.length === 0) {
 return (
 <div className="panel">
 <EmptyState
 title={emptyTitle}
 description={emptyDescription}
 icon={emptyIcon}
 />
 </div>
 );
 }

 return (
 <div className={`panel overflow-hidden ${className}`}>
 <div className="overflow-x-auto scrollbar-hide">
 <table className="data-table min-w-[720px]">
 <thead>
 <tr>
 {columns.map((col) => (
 <th
 key={col.key}
 className={sortable && col.sortable !== false ? "cursor-pointer select-none" : ""}
 onClick={() => col.sortable !== false && toggleSort(col.key)}
 >
 <div className="flex items-center gap-1.5">
 {col.label}
 {sortable && col.sortable !== false && sortKey === col.key && (
 sortDir === "asc" ? (
 <ChevronUp className="h-3 w-3" />
 ) : (
 <ChevronDown className="h-3 w-3" />
 )
 )}
 </div>
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {paginatedData.map((row, idx) => (
 <motion.tr
 key={row._id || row.id || idx}
 initial={{ opacity: 0, x: -8 }}
 animate={{ opacity: 1, x: 0 }}
 transition={{ delay: idx * 0.03 }}
 className={onRowClick ? "cursor-pointer" : ""}
 onClick={() => onRowClick?.(row)}
 >
 {columns.map((col) => (
 <td key={col.key}>
 {col.render ? col.render(row[col.key], row) : row[col.key]}
 </td>
 ))}
 </motion.tr>
 ))}
 </tbody>
 </table>
 </div>

 {/* Pagination */}
 {totalPages > 1 && (
 <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-t border-slate-100 px-4 py-3 ">
 <p className="text-xs text-slate-500">
 Showing {currentPage * pageSize + 1}–
 {Math.min((currentPage + 1) * pageSize, sortedData.length)} of{" "}
 {sortedData.length}
 </p>
 <div className="flex items-center gap-1">
 <button
 type="button"
 disabled={currentPage === 0}
 onClick={() => setPage(currentPage - 1)}
 className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 "
 aria-label="Previous page"
 >
 <ChevronLeft className="h-4 w-4" />
 </button>
 {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
 const pageNum = totalPages <= 5
 ? i
 : Math.max(0, Math.min(currentPage - 2, totalPages - 5)) + i;
 return (
 <button
 key={pageNum}
 type="button"
 onClick={() => setPage(pageNum)}
 className={`h-8 min-w-8 rounded-lg px-2 text-xs font-semibold transition ${
 pageNum === currentPage
 ? "bg-primary-600 text-white shadow-sm"
 : "text-slate-500 hover:bg-slate-100 "
 }`}
 >
 {pageNum + 1}
 </button>
 );
 })}
 <button
 type="button"
 disabled={currentPage >= totalPages - 1}
 onClick={() => setPage(currentPage + 1)}
 className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:opacity-40 "
 aria-label="Next page"
 >
 <ChevronRight className="h-4 w-4" />
 </button>
 </div>
 </div>
 )}
 </div>
 );
}
