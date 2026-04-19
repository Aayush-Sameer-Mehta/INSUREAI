import { ChevronDown, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AccordionMenu({ node, activeId, activePathIds, onSelect }) {
 const isLeaf = !node.children || node.children.length === 0;
 const isNodeActive = activeId === node.id;
 const hasActiveChild = !isLeaf && activePathIds.has(node.id);
 const isOpen = isNodeActive || hasActiveChild;

 const handleClick = (e) => {
 e.stopPropagation();
 onSelect(node.id);
 };

 return (
 <div className="w-full">
 <button
 onClick={handleClick}
 className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition-all duration-200 ${
 isNodeActive
 ? "bg-indigo-50 text-indigo-700 font-semibold "
 : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 "
 }`}
 >
 <span className="truncate">{node.label}</span>
 {!isLeaf && (
 <span className="shrink-0 text-slate-400">
 {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
 </span>
 )}
 </button>

 {!isLeaf && (
 <AnimatePresence initial={false}>
 {isOpen && (
 <motion.div
 initial={{ height: 0, opacity: 0 }}
 animate={{ height: "auto", opacity: 1 }}
 exit={{ height: 0, opacity: 0 }}
 transition={{ duration: 0.2, ease: "easeInOut" }}
 className="overflow-hidden"
 >
 <div className="ml-3 mt-1 space-y-1 border-l border-slate-200 pl-2 ">
 {node.children.map((child) => (
 <AccordionMenu
 key={child.id}
 node={child}
 activeId={activeId}
 activePathIds={activePathIds}
 onSelect={onSelect}
 />
 ))}
 </div>
 </motion.div>
 )}
 </AnimatePresence>
 )}
 </div>
 );
}
