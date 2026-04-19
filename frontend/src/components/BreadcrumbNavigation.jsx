import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";
import { findNodeById, POLICY_HIERARCHY } from "../utils/policyHierarchy";

export default function BreadcrumbNavigation({ activeId, setActiveId }) {
 let breadcrumbs = [{ id: "home-app", label: <Home className="h-4 w-4" />, isHome: true }];

 if (activeId === "all") {
 breadcrumbs.push({ id: "all", label: "All Policies" });
 } else {
 // Find path in hierarchy
 const result = findNodeById(POLICY_HIERARCHY, activeId);
 if (result) {
 breadcrumbs.push({ id: "all", label: "Policies" });
 breadcrumbs = breadcrumbs.concat(result.path);
 } else {
 breadcrumbs.push({ id: "all", label: "All Policies" });
 }
 }

 return (
 <nav className="mb-6 flex items-center overflow-x-auto whitespace-nowrap scrollbar-hide text-sm text-slate-500 ">
 {breadcrumbs.map((crumb, index) => {
 const isLast = index === breadcrumbs.length - 1;
 return (
 <div key={crumb.id} className="flex items-center">
 {index > 0 && <ChevronRight className="mx-2 h-4 w-4 shrink-0 text-slate-300 " />}
 {isLast ? (
 <span className="font-semibold text-slate-900 ">{crumb.label}</span>
 ) : (
 <button
 onClick={() => crumb.isHome ? window.location.href = "/" : setActiveId(crumb.id)}
 className="hover:text-indigo-600 transition-colors "
 >
 {crumb.label}
 </button>
 )}
 </div>
 );
 })}
 </nav>
 );
}
