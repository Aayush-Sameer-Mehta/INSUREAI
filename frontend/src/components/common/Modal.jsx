import { useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const sizeClasses = {
 sm: "max-w-md",
 md: "max-w-lg",
 lg: "max-w-2xl",
 xl: "max-w-4xl",
 full: "max-w-[90vw]",
};

const overlayVariants = {
 hidden: { opacity: 0 },
 visible: { opacity: 1 },
};

const contentVariants = {
 hidden: { opacity: 0, scale: 0.95, y: 8 },
 visible: {
 opacity: 1,
 scale: 1,
 y: 0,
 transition: { type: "spring", stiffness: 350, damping: 30 },
 },
 exit: { opacity: 0, scale: 0.95, y: 8, transition: { duration: 0.15 } },
};

export default function Modal({
 open,
 onClose,
 title,
 description,
 children,
 size = "md",
 showClose = true,
 closeOnOverlay = true,
 footer,
}) {
 const handleKeyDown = useCallback(
 (e) => {
 if (e.key === "Escape") onClose?.();
 },
 [onClose]
 );

 useEffect(() => {
 if (open) {
 document.addEventListener("keydown", handleKeyDown);
 document.body.style.overflow = "hidden";
 }
 return () => {
 document.removeEventListener("keydown", handleKeyDown);
 document.body.style.overflow = "";
 };
 }, [open, handleKeyDown]);

 return (
 <AnimatePresence>
 {open && (
 <motion.div
 variants={overlayVariants}
 initial="hidden"
 animate="visible"
 exit="hidden"
 className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-md"
 onClick={closeOnOverlay ? onClose : undefined}
 role="dialog"
 aria-modal="true"
 aria-label={title}
 >
 <motion.div
 variants={contentVariants}
 initial="hidden"
 animate="visible"
 exit="exit"
 className={`relative flex max-h-[92vh] sm:max-h-[90vh] w-full flex-col overflow-hidden ${sizeClasses[size]} rounded-2xl sm:rounded-panel border border-slate-200/80 bg-white shadow-2xl`}
 onClick={(e) => e.stopPropagation()}
 >
 {/* Header */}
 {(title || showClose) && (
 <div className="flex items-start justify-between border-b border-slate-100 px-4 sm:px-6 py-4 ">
 <div>
 {title && (
 <h2 className="text-lg font-bold text-slate-900 ">
 {title}
 </h2>
 )}
 {description && (
 <p className="mt-0.5 text-sm text-slate-500 ">
 {description}
 </p>
 )}
 </div>
 {showClose && (
 <button
 type="button"
 onClick={onClose}
 className="rounded-lg p-1.5 text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 "
 aria-label="Close dialog"
 >
 <X className="h-4 w-4" />
 </button>
 )}
 </div>
 )}

 {/* Body */}
 <div className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>

 {/* Footer */}
 {footer && (
 <div className="shrink-0 border-t border-slate-100 bg-white/95 px-4 sm:px-6 py-4 backdrop-blur ">
 {footer}
 </div>
 )}
 </motion.div>
 </motion.div>
 )}
 </AnimatePresence>
 );
}
