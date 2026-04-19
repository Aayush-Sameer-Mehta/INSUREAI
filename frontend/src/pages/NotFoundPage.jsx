import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Search, ArrowLeft } from "lucide-react";

export default function NotFoundPage() {
 return (
 <div className="flex min-h-[80vh] items-center justify-center px-4">
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
 className="w-full max-w-md text-center"
 >
 {/* Animated 404 number */}
 <motion.div
 initial={{ scale: 0.8, opacity: 0 }}
 animate={{ scale: 1, opacity: 1 }}
 transition={{ duration: 0.6, delay: 0.1, type: "spring", stiffness: 200 }}
 className="mx-auto mb-6"
 >
 <span className="bg-gradient-to-r from-primary-500 via-secondary-500 to-accent-500 bg-clip-text text-8xl font-extrabold tracking-tight text-transparent sm:text-9xl">
 404
 </span>
 </motion.div>

 {/* Content card */}
 <div className="glass-panel p-8">
 <h1 className="text-2xl font-bold tracking-tight text-slate-900 ">
 Page not found
 </h1>
 <p className="mt-3 text-sm leading-relaxed text-slate-500 ">
 The page you're looking for doesn't exist or has been moved.
 Let's get you back on track.
 </p>

 <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
 <Link
 to="/"
 className="btn-primary"
 >
 <Home className="h-4 w-4" />
 Go Home
 </Link>
 <Link
 to="/policies"
 className="btn-ghost"
 >
 <Search className="h-4 w-4" />
 Browse Policies
 </Link>
 </div>
 </div>

 <button
 type="button"
 onClick={() => window.history.back()}
 className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-primary-600 "
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 Go back
 </button>
 </motion.div>
 </div>
 );
}
