import { motion } from "framer-motion";

const containerVariants = {
 hidden: { opacity: 0 },
 visible: {
 opacity: 1,
 transition: { staggerChildren: 0.1 },
 },
};

/**
 * Standard page wrapper with decorative background orbs and stagger animations.
 * Replaces the hand-coded background divs copy-pasted across Dashboard, Login, etc.
 */
export default function PageShell({ children, className = "" }) {
 return (
 <motion.div
 initial="hidden"
 animate="visible"
 variants={containerVariants}
 className={`space-y-8 page-shell ${className}`}
 >
 {/* Decorative background */}
 <div className="pointer-events-none fixed inset-0 overflow-hidden">
 <div className="absolute -right-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-primary-400/10 to-violet-400/8 blur-3xl animate-glow-right" />
 <div className="absolute -bottom-40 -left-40 h-[30rem] w-[30rem] rounded-full bg-gradient-to-br from-secondary-400/8 to-cyan-400/8 blur-3xl animate-glow-left" />
 </div>
 {children}
 </motion.div>
 );
}
