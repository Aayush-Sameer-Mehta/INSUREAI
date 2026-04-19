import React from "react";
import { findNodeById, POLICY_HIERARCHY } from "../utils/policyHierarchy";
import AccordionMenu from "./AccordionMenu";

export default function CategorySidebar({ activeId, setActiveId }) {
 const activePathIds =
 activeId === "all"
 ? new Set()
 : new Set(findNodeById(POLICY_HIERARCHY, activeId)?.path.map((item) => item.id) || []);

 return (
 <aside className="sticky top-24 max-h-[calc(100vh-8rem)] w-full overflow-y-auto rounded-2xl border border-slate-200/60 bg-white/60 p-3 sm:p-4 shadow-sm backdrop-blur-xl scrollbar-hide md:w-72 shrink-0">
 <div className="mb-3 sm:mb-4 flex items-center justify-between">
 <h2 className="text-base sm:text-lg font-bold text-slate-800 ">
 Categories
 </h2>
 <button
 onClick={() => setActiveId("all")}
 className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 "
 >
 Clear
 </button>
 </div>

 <div className="space-y-1">
 <button
 onClick={() => setActiveId("all")}
 className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
 activeId === "all"
 ? "bg-indigo-50 text-indigo-700 font-semibold "
 : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 "
 }`}
 >
 All Policies
 </button>

 {POLICY_HIERARCHY.map((rootNode) => (
 <AccordionMenu
 key={rootNode.id}
 node={rootNode}
 activeId={activeId}
 activePathIds={activePathIds}
 onSelect={setActiveId}
 />
 ))}
 </div>
 </aside>
 );
}
