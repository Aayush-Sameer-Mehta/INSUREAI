import React, { useState } from "react";
import styles from "../../../styles/components.module.css";

export const DataTable = ({
 columns = [],
 data = [],
 loading = false,
 pagination = null,
 emptyState = null,
 onRowClick = null,
 sortBy = null,
 onSort = null,
}) => {
 const [sortConfig, setSortConfig] = useState(sortBy || {});

 const handleSort = (key) => {
 if (!onSort) return;

 const direction =
 sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc";
 setSortConfig({ key, direction });
 onSort(key, direction);
 };

 if (loading) {
 return (
 <div className={styles.tableContainer}>
 <div className={styles.loadingState}>
 <div className={styles.spinner}></div>
 <p>Loading...</p>
 </div>
 </div>
 );
 }

 if (!data || data.length === 0) {
 return (
 <div className={styles.tableContainer}>
 <div className={styles.emptyState}>
 {emptyState?.icon && (
 <div className={styles.emptyIcon}>{emptyState.icon}</div>
 )}
 <h3>{emptyState?.title || "No data available"}</h3>
 <p>{emptyState?.message || "There are no records to display."}</p>
 {emptyState?.action && (
 <button
 className={styles.emptyActionBtn}
 onClick={emptyState.action.onClick}
 >
 {emptyState.action.label}
 </button>
 )}
 </div>
 </div>
 );
 }

 return (
 <div className={styles.tableContainer}>
 <table className={styles.dataTable}>
 <thead>
 <tr>
 {columns.map((column) => (
 <th key={column.key}>
 {column.sortable ? (
 <button
 className={styles.sortHeader}
 onClick={() => handleSort(column.key)}
 >
 {column.label}
 {sortConfig.key === column.key && (
 <span>
 {sortConfig.direction === "asc" ? " ▲" : " ▼"}
 </span>
 )}
 </button>
 ) : (
 column.label
 )}
 </th>
 ))}
 </tr>
 </thead>
 <tbody>
 {data.map((row, rowIdx) => (
 <tr
 key={row._id || rowIdx}
 onClick={() => onRowClick?.(row)}
 className={onRowClick ? styles.clickableRow : ""}
 >
 {columns.map((column) => (
 <td key={`${row._id || rowIdx}-${column.key}`}>
 {column.render
 ? column.render(row[column.key], row)
 : row[column.key]}
 </td>
 ))}
 </tr>
 ))}
 </tbody>
 </table>

 {pagination && (
 <div className={styles.pagination}>
 <div className={styles.pageInfo}>
 Showing {Math.min(pagination.limit, data.length)} of{" "}
 {pagination.total} items
 </div>
 <div className={styles.pageButtons}>
 <button
 disabled={pagination.page === 1}
 onClick={() => pagination.onPageChange?.(pagination.page - 1)}
 className={styles.pageBtn}
 >
 ← Previous
 </button>

 <span className={styles.pageNumber}>
 Page {pagination.page} of{" "}
 {Math.ceil(pagination.total / pagination.limit)}
 </span>

 <button
 disabled={pagination.page * pagination.limit >= pagination.total}
 onClick={() => pagination.onPageChange?.(pagination.page + 1)}
 className={styles.pageBtn}
 >
 Next →
 </button>
 </div>
 </div>
 )}
 </div>
 );
};

export default DataTable;
