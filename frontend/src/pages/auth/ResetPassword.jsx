import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Lock, ArrowRight, ArrowLeft, KeyRound, Shield, CheckCircle2, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { resetPassword } from "../../services/authService";

/* ─── animation variants ─────────────────────────────── */

export default function ResetPassword() {
 const navigate = useNavigate();
 const [form, setForm] = useState({ token: "", newPassword: "", confirmPassword: "" });
 const [loading, setLoading] = useState(false);
 const [focusedField, setFocusedField] = useState(null);
 const [showPasswords, setShowPasswords] = useState({ newPassword: false, confirmPassword: false });

 const onSubmit = async (event) => {
 event.preventDefault();
 if (!form.token.trim()) {
 toast.error("Reset token is required");
 return;
 }
 if (form.newPassword.length < 6) {
 toast.error("Password must be at least 6 characters");
 return;
 }
 if (form.newPassword !== form.confirmPassword) {
 toast.error("Passwords do not match");
 return;
 }

 setLoading(true);
 try {
 await resetPassword(form.token, form.newPassword);
 toast.success("Password reset successful!");
 navigate("/login");
 } catch (err) {
 toast.error(err?.response?.data?.message || "Reset failed");
 } finally {
 setLoading(false);
 }
 };

 const FIELDS = [
 { key: "token", label: "Reset Token", type: "text", placeholder: "Paste your reset token", icon: KeyRound },
 { key: "newPassword", label: "New Password", type: "password", placeholder: "Min 6 characters", icon: Lock },
 { key: "confirmPassword", label: "Confirm Password", type: "password", placeholder: "Re-enter password", icon: CheckCircle2 },
 ];

 return (
 <div className="flex min-h-[75vh] items-center justify-center px-4">
 {/* ─── Background orbs ───────────────────────────── */}
 <div className="pointer-events-none fixed inset-0 overflow-hidden">
 <div
 className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-rose-400/20 to-pink-400/20 blur-3xl"
 />
 <div
 className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-violet-400/15 to-indigo-400/15 blur-3xl"
 />
 </div>

 <div
 initial="hidden"
 animate="visible"
 className="relative z-10 w-full max-w-md"
 >
 {/* ─── Icon header ─────────────────────────────── */}
 <div className="mb-8 text-center">
 <div
 className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 shadow-xl shadow-rose-500/25"
 >
 <Shield className="h-8 w-8 text-white" />
 </div>
 <h1 className="text-3xl font-bold tracking-tight text-slate-900 ">
 Reset Password
 </h1>
 <p className="mt-2 text-slate-500 ">
 Enter your reset token and new password
 </p>
 </div>

 {/* ─── Card ────────────────────────────────────── */}
 <div
 className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl "
 >
 <form onSubmit={onSubmit} className="space-y-5">
 {FIELDS.map(({ key, label, type, placeholder, icon: Icon }) => (
 <div key={key}>
 <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
 <Icon className="h-4 w-4 text-rose-500" />
 {label}
 </label>
 <div
 className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all ${focusedField === key
 ? "border-rose-500 shadow-lg shadow-rose-500/10 "
 : "border-slate-200 "
 }`}
 >
 <input
 type={type === "password" && showPasswords[key] ? "text" : type}
 placeholder={placeholder}
 value={form[key]}
 onFocus={() => setFocusedField(key)}
 onBlur={() => setFocusedField(null)}
 onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
 className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 "
 />
 {type === "password" && (
 <button
 type="button"
 onClick={() => setShowPasswords((p) => ({ ...p, [key]: !p[key] }))}
 className="shrink-0 text-slate-400 transition hover:text-rose-500 "
 tabIndex={-1}
 >
 {showPasswords[key] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
 </button>
 )}
 </div>
 </div>
 ))}

 <div>
 <button
 disabled={loading}
 type="submit"
 className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-500/25 transition disabled:cursor-not-allowed disabled:opacity-60"
 >
 {loading ? (
 <>
 <div
 className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white"
 />
 Resetting...
 </>
 ) : (
 <>
 <Lock className="h-4 w-4" />
 Reset Password
 <ArrowRight className="h-4 w-4" />
 </>
 )}
 </button>
 </div>
 </form>

 <div className="mt-6">
 <p className="text-center text-sm text-slate-600 ">
 <Link
 to="/login"
 className="inline-flex items-center gap-1 font-semibold text-rose-600 transition hover:text-rose-700 "
 >
 <ArrowLeft className="h-3.5 w-3.5" />
 Back to Sign In
 </Link>
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
