import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { GoogleLogin } from "@react-oauth/google";
import {
  ArrowRight,
  CheckCircle2,
  CircleAlert,
  Eye,
  EyeOff,
  FileText,
  Headphones,
  Loader2,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  Shield,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input } from "../../components/common";
import BrandMark from "../../components/BrandMark";
import { loginSchema } from "../../validation";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";
import familyProtectionImage from "../../assets/image/family-protection.png";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Bank-grade security" },
  { icon: FileText, label: "Policy data in one place" },
  { icon: Headphones, label: "Claims support ready" },
];

const CHECKPOINTS = [
  "Auto routes users and admins",
  "Protected policy workspace",
  "Fast claims and renewals access",
];

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, isAuthenticated, authLoading, dashboardRoute } =
    useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const isGoogleConfigured =
    typeof googleClientId === "string" &&
    googleClientId.endsWith(".apps.googleusercontent.com") &&
    !googleClientId.includes("your-google-client-id");
  const redirectAfterLogin = useMemo(() => {
    const requestedPath = location.state?.from?.pathname;
    return requestedPath || dashboardRoute || "/dashboard";
  }, [dashboardRoute, location.state]);

  const {
    register,
    setError,
    clearErrors,
    handleSubmit,
    formState: { errors, isSubmitting, isValid, submitCount },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useScrollToFirstError(errors, submitCount);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      navigate(redirectAfterLogin, { replace: true });
    }
  }, [authLoading, isAuthenticated, navigate, redirectAfterLogin]);

  const onSubmit = async (data) => {
    clearErrors("root");
    try {
      const response = await login(data);
      toast.success("Signed in successfully");
      navigate(response.dashboardRoute || redirectAfterLogin, { replace: true });
    } catch (err) {
      const message = err?.response?.data?.message || "Login failed";
      setError("root.serverError", { type: "server", message });
      toast.error(message);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    clearErrors("root");
    setIsGoogleLoading(true);
    try {
      if (!credentialResponse?.credential) {
        throw new Error("Google did not return credentials.");
      }
      const response = await loginWithGoogle(credentialResponse.credential);
      toast.success("Successfully signed in with Google!");
      navigate(response.dashboardRoute || redirectAfterLogin, { replace: true });
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Google sign-in failed. Please try again.";
      setError("root.serverError", { type: "server", message });
      toast.error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleError = () => {
    const message = "Google sign-in failed. Please try again.";
    setError("root.serverError", { type: "server", message });
    toast.error(message);
    setIsGoogleLoading(false);
  };

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
          Checking your session...
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 px-3 py-3 text-slate-900 sm:px-5 sm:py-5 lg:px-6">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,_#eaf2ff_0%,_#f8fafc_34%,_#ecfdf5_72%,_#fff7ed_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.28] [background-image:linear-gradient(rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:48px_48px]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl items-center py-4 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
          className="grid w-full overflow-hidden rounded-[1.25rem] border border-white/70 bg-white/85 shadow-[0_32px_100px_rgba(15,23,42,0.18)] backdrop-blur-xl lg:grid-cols-[1.05fr_0.95fr]"
        >
          <aside className="relative hidden min-h-0 overflow-hidden bg-slate-950 p-7 text-white lg:flex lg:flex-col xl:p-9">
            <div className="absolute inset-0 bg-[linear-gradient(145deg,_rgba(37,99,235,0.32)_0%,_rgba(15,23,42,0)_44%),linear-gradient(35deg,_rgba(20,184,166,0.22)_0%,_rgba(15,23,42,0)_48%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]" />
            <div className="absolute inset-x-0 bottom-0 h-56 bg-[linear-gradient(0deg,_rgba(245,158,11,0.16)_0%,_rgba(15,23,42,0)_100%)]" />

            <div className="relative z-10 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-lg">
                <BrandMark className="h-7 w-7" />
              </div>
              <div>
                <p className="font-display text-lg font-bold">InsureAI</p>
                <p className="text-xs font-medium text-slate-300">
                  Intelligent insurance workspace
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-8 max-w-xl xl:mt-10">
              <p className="text-sm font-semibold uppercase text-teal-200">
                Welcome back
              </p>
              <h1 className="mt-3 font-display text-[2.6rem] font-extrabold leading-[0.98] tracking-tight xl:text-[3.35rem]">
                Sign in to manage every policy decision with confidence.
              </h1>
              <p className="mt-4 max-w-lg text-sm leading-6 text-slate-300">
                Review coverage, claims, renewals, and recommendations from a
                secure dashboard built for insurance workflows.
              </p>
            </div>

            <div className="relative z-10 mt-6 grid gap-2.5 xl:mt-7">
              {TRUST_ITEMS.map(({ icon: Icon, label }) => (
                <div
                  key={label}
                  className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/8 px-4 py-2.5 shadow-inner shadow-white/5"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/12 text-teal-200">
                    <Icon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-100">
                    {label}
                  </span>
                </div>
              ))}
            </div>

            <div className="relative z-10 mt-auto pt-5">
              <div className="grid overflow-hidden rounded-[1.25rem] border border-white/10 bg-white/10 shadow-2xl shadow-slate-950/40 lg:grid-cols-[1fr_168px]">
                <div className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="inline-flex items-center gap-2 rounded-full bg-emerald-400/12 px-3 py-1 text-xs font-semibold text-emerald-100">
                      <Shield className="h-3.5 w-3.5" />
                      Protected access
                    </div>
                    <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] font-semibold text-slate-200">
                      Live
                    </span>
                  </div>
                  <div className="mt-4 grid gap-2">
                    {CHECKPOINTS.map((item) => (
                      <div
                        key={item}
                        className="flex items-center gap-2 text-xs font-medium text-slate-200"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-300" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="relative hidden min-h-32 overflow-hidden border-l border-white/10 bg-slate-900/40 xl:block">
                  <img
                    src={familyProtectionImage}
                    alt="Family protected by insurance coverage"
                    className="h-full w-full object-cover object-center opacity-90"
                  />
                  <div className="absolute inset-0 bg-[linear-gradient(90deg,_rgba(15,23,42,0.5)_0%,_rgba(15,23,42,0.08)_100%)]" />
                </div>
              </div>
            </div>
          </aside>

          <section className="flex min-h-0 items-center justify-center overflow-hidden px-4 py-5 sm:px-8 lg:px-10 xl:px-12">
            <div className="w-full max-w-md">
              <div className="mb-5 flex items-center gap-3 lg:hidden">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 shadow-lg">
                  <BrandMark className="h-7 w-7" />
                </div>
                <div>
                  <p className="font-display text-lg font-bold text-slate-950">
                    InsureAI
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Secure insurance workspace
                  </p>
                </div>
              </div>

              <div className="rounded-[1.25rem] border border-slate-200/80 bg-white p-5 shadow-[0_18px_60px_rgba(15,23,42,0.10)] sm:p-7">
                <div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    Secure sign-in
                  </div>
                  <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-slate-950">
                    Welcome back
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-slate-500">
                    Enter your credentials and InsureAI will open the right
                    dashboard for your account.
                  </p>
                </div>

                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="mt-6 space-y-4"
                  noValidate
                >
                  <Input
                    label="Email Address"
                    icon={Mail}
                    type="email"
                    placeholder="you@example.com"
                    autoComplete="email"
                    autoFocus
                    {...register("email")}
                    error={errors.email?.message}
                  />

                  <div>
                    <label className="field-label">
                      <Lock className="mr-1 inline h-4 w-4 text-primary-500" />
                      Password
                    </label>
                    <div
                      className={`group flex min-h-[50px] items-center gap-3 rounded-btn border bg-white px-4 py-3 transition-all ${
                        errors.password
                          ? "border-red-400"
                          : "border-slate-200 focus-within:border-primary-500 focus-within:ring-2 focus-within:ring-primary-100"
                      }`}
                    >
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        {...register("password")}
                        className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="shrink-0 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-primary-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="field-error-text" role="alert">
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="inline-flex items-center gap-2 text-xs font-medium text-slate-500">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Role detected automatically
                    </div>
                    <Link
                      to="/forgot-password"
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 transition hover:text-primary-700"
                    >
                      <KeyRound className="h-3.5 w-3.5" />
                      Forgot Password?
                    </Link>
                  </div>

                  {errors.root?.serverError?.message && (
                    <div
                      className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-medium text-red-700"
                      role="alert"
                    >
                      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      <span>{errors.root.serverError.message}</span>
                    </div>
                  )}

                  <Button
                    type="submit"
                    loading={isSubmitting}
                    disabled={!isValid || isSubmitting || isGoogleLoading}
                    icon={LogIn}
                    iconRight={ArrowRight}
                    className="min-h-[50px] w-full bg-gradient-to-r from-primary-500 to-[#7a97e8] hover:from-primary-600 hover:to-[#6f8ad9]"
                  >
                    Sign in
                  </Button>
                </form>

                <div className="mt-5">
                  <div className="divider-labeled text-xs font-medium text-slate-400">
                    or continue with
                  </div>

                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
                    <div className="flex min-h-[44px] justify-center">
                      {isGoogleConfigured ? (
                        <div className="w-full">
                          {isGoogleLoading ? (
                            <div className="inline-flex min-h-[44px] w-full items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-600">
                              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
                              Finishing Google sign-in...
                            </div>
                          ) : (
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={handleGoogleError}
                              theme="outline"
                              size="large"
                              width="100%"
                            />
                          )}
                        </div>
                      ) : (
                        <p className="flex items-center justify-center text-center text-xs font-medium text-slate-500">
                          Google sign-in is not configured for this environment.
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="mt-5 text-center text-sm text-slate-600">
                    Need a new user account?{" "}
                    <Link
                      to="/register"
                      className="inline-flex items-center gap-1 font-semibold text-primary-600 transition hover:text-primary-700"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      Create an account
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </motion.div>
      </div>
    </div>
  );
}
