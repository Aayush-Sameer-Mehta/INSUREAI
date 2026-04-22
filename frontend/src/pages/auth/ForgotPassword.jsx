import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  ArrowRight,
  KeyRound,
  Shield,
  ArrowLeft,
  CheckCircle2,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import { forgotPassword } from "../../services/authService";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [focusedField, setFocusedField] = useState(null);

  const onSubmit = async (event) => {
    event.preventDefault();
    if (!/\S+@\S+\.\S+/.test(email)) {
      toast.error("Please enter a valid email");
      return;
    }
    setLoading(true);
    try {
      await forgotPassword(email);
      setSent(true);
      toast.success("Check your email for the reset link!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Unable to process request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4">
      {/* ─── Background orbs ───────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-gradient-to-br from-amber-400/20 to-orange-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-gradient-to-br from-rose-400/15 to-pink-400/15 blur-3xl" />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* ─── Icon header ─────────────────────────────── */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-xl shadow-amber-500/25">
            <KeyRound className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 ">
            Forgot Password?
          </h1>
          <p className="mt-2 text-slate-500 ">
            Enter your email and we'll send you a reset link
          </p>
        </div>

        {/* ─── Card ────────────────────────────────────── */}
        <div className="overflow-hidden rounded-3xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-slate-200/50 backdrop-blur-xl ">
          {!sent ? (
            <form onSubmit={onSubmit} className="space-y-5">
              <div>
                <label className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-700 ">
                  <Mail className="h-4 w-4 text-amber-500" />
                  Email Address
                </label>
                <div
                  className={`flex items-center gap-3 rounded-xl border-2 bg-white px-4 py-3 transition-all ${
                    focusedField === "email"
                      ? "border-amber-500 shadow-lg shadow-amber-500/10 "
                      : "border-slate-200 "
                  }`}
                >
                  <input
                    type="email"
                    placeholder="your@example.com"
                    value={email}
                    onFocus={() => setFocusedField("email")}
                    onBlur={() => setFocusedField(null)}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 "
                  />
                </div>
              </div>

              <div>
                <button
                  disabled={loading}
                  type="submit"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Reset Link
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 ">
                <CheckCircle2 className="h-7 w-7 text-emerald-500" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 ">
                Check Your Email
              </h2>
              <p className="mt-2 text-sm text-slate-500 ">
                We've sent a password reset link to{" "}
                <strong className="text-slate-700">{email}</strong>
              </p>

              <div className="mt-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800">
                <p className="mb-2 flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <strong>Link expires in 15 minutes</strong>
                </p>
                <p className="text-xs">
                  Check your spam/junk folder if you don't see it
                </p>
              </div>

              <button
                onClick={() => setSent(false)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-amber-500/25 transition hover:shadow-xl"
              >
                <Mail className="h-4 w-4" />
                Send Again
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Back to login */}
          <div className="mt-6">
            <p className="text-center text-sm text-slate-600 ">
              <Link
                to="/login"
                className="inline-flex items-center gap-1 font-semibold text-amber-600 transition hover:text-amber-700 "
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
