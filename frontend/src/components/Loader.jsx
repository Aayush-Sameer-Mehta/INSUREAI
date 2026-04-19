import { motion } from "framer-motion";

export default function Loader({ label = "Loading..." }) {
 return (
 <div className="flex min-h-[50vh] flex-col items-center justify-center gap-5">
 {/* Premium triple-ring animated loader */}
 <div className="relative h-14 w-14">
 {/* Outer ring */}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
 className="absolute inset-0 rounded-full border-[2.5px] border-transparent border-t-primary-600 border-r-primary-400/30 "
 />
 {/* Middle ring */}
 <motion.div
 animate={{ rotate: -360 }}
 transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
 className="absolute inset-1.5 rounded-full border-[2px] border-transparent border-b-secondary-500 border-l-secondary-400/30 "
 />
 {/* Inner ring */}
 <motion.div
 animate={{ rotate: 360 }}
 transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
 className="absolute inset-3 rounded-full border-[2px] border-transparent border-t-accent-500/80 "
 />
 {/* Center glow dot */}
 <div className="absolute inset-0 flex items-center justify-center">
 <motion.div
 animate={{ scale: [1, 1.3, 1], opacity: [0.6, 1, 0.6] }}
 transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
 className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg shadow-primary-500/30"
 />
 </div>
 </div>
 <motion.p
 initial={{ opacity: 0, y: 6 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ delay: 0.3 }}
 className="text-sm font-medium text-slate-500 "
 >
 {label}
 </motion.p>
 </div>
 );
}
