import { Component } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

export default class ErrorBoundary extends Component {
 constructor(props) {
 super(props);
 this.state = { hasError: false, error: null };
 }

 static getDerivedStateFromError(error) {
 return { hasError: true, error };
 }

 componentDidCatch(error, errorInfo) {
 console.error("ErrorBoundary caught:", error, errorInfo);
 }

 handleReset = () => {
 this.setState({ hasError: false, error: null });
 };

 render() {
 if (!this.state.hasError) {
 return this.props.children;
 }

 return (
 <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 px-4 ">
 <div className="relative z-10 w-full max-w-md text-center">
 {/* Icon */}
 <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-xl shadow-rose-500/25">
 <AlertTriangle className="h-10 w-10 text-white" />
 </div>

 {/* Content card */}
 <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl backdrop-blur-xl ">
 <h1 className="text-2xl font-bold tracking-tight text-slate-900 ">
 Something went wrong
 </h1>
 <p className="mt-3 text-sm leading-relaxed text-slate-500 ">
 An unexpected error occurred. Don't worry — your data is safe. Try refreshing or head back to the home page.
 </p>

 {/* Error details (dev mode) */}
 {import.meta.env.DEV && this.state.error && (
 <div className="mt-4 rounded-xl bg-rose-50 p-3 text-left ">
 <p className="text-xs font-mono text-rose-700 break-all">
 {this.state.error.message}
 </p>
 </div>
 )}

 {/* Action buttons */}
 <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
 <button
 onClick={this.handleReset}
 className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition hover:shadow-xl hover:scale-[1.03] active:scale-[0.97]"
 >
 <RefreshCw className="h-4 w-4" />
 Try Again
 </button>

 <Link
 to="/"
 onClick={this.handleReset}
 className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 hover:scale-[1.03] active:scale-[0.97] "
 >
 <Home className="h-4 w-4" />
 Go Home
 </Link>
 </div>
 </div>

 {/* Footer text */}
 <p className="mt-6 text-xs text-slate-400 ">
 If this keeps happening, please contact support@insureai.in
 </p>
 </div>
 </div>
 );
 }
}
