import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Briefcase,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogIn,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCircle2,
} from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input } from "../../components/common";
import BrandMark from "../../components/BrandMark";
import { loginSchema } from "../../validation";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";

const ROLE_OPTIONS = [
  {
    value: "USER",
    label: "User",
    hint: "Personal insurance access",
    icon: UserCircle2,
    accent: "from-sky-500 to-blue-600",
  },
  {
    value: "AGENT",
    label: "Agent",
    hint: "Advisory workspace access",
    icon: Briefcase,
    accent: "from-emerald-500 to-teal-600",
  },
  {
    value: "ADMIN",
    label: "Admin",
    hint: "Operations and control access",
    icon: ShieldCheck,
    accent: "from-amber-500 to-orange-500",
  },
];

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting, isValid, submitCount },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      login_role: "USER",
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useScrollToFirstError(errors, submitCount);

  const selectedRoleValue = useWatch({ control, name: "login_role" });
  const selectedRole =
    ROLE_OPTIONS.find((option) => option.value === selectedRoleValue) ||
    ROLE_OPTIONS[0];

  const SelectedRoleIcon = selectedRole.icon;

  const onSubmit = async (data) => {
    try {
      const response = await login(data);
      toast.success(`Signed in as ${selectedRole.label}`);
      navigate(response.dashboardRoute || "/dashboard");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-100 px-4 py-10 sm:px-6">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(160deg,_#f8fafc_0%,_#eef4ff_48%,_#f8fafc_100%)]" />
        <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="absolute right-0 top-10 h-80 w-80 rounded-full bg-amber-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-emerald-200/20 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md rounded-[2rem] border border-white/80 bg-white/90 p-6 shadow-[0_24px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl sm:p-8"
      >
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-900 shadow-lg">
            <BrandMark className="h-9 w-9" />
          </div>
          <h1 className="mt-5 font-display text-3xl font-bold tracking-tight text-slate-950">
            Sign in to InsureAI
          </h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Access your workspace securely and continue where you left off.
          </p>
        </div>

        <div className="mb-6 rounded-[1.5rem] border border-slate-200 bg-slate-50/90 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Access Type
          </p>
          <div className="mt-4 grid gap-3">
            {ROLE_OPTIONS.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRoleValue === role.value;

              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => setValue("login_role", role.value, { shouldValidate: true })}
                  disabled={isSubmitting}
                  className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left transition-all ${
                    isSelected
                      ? "border-slate-900 bg-slate-900 text-white shadow-lg"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br ${role.accent}`}
                  >
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{role.label}</p>
                    <p
                      className={`mt-1 text-xs ${
                        isSelected ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {role.hint}
                    </p>
                  </div>
                  {isSelected && (
                    <SelectedRoleIcon className="h-4 w-4 text-white/80" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {errors.login_role && (
          <p className="mb-4 text-sm text-red-500">
            {errors.login_role.message}
          </p>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
          <Input
            label="Email Address"
            icon={Mail}
            type="email"
            placeholder="you@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <div>
            <label className="field-label">
              <Lock className="mr-1 inline h-4 w-4 text-primary-500" />
              Password
            </label>
            <div
              className={`group flex items-center gap-3 rounded-btn border-2 bg-white px-4 py-3 transition-all ${
                errors.password
                  ? "border-red-400"
                  : "border-slate-200 focus-within:border-primary-500 focus-within:shadow-glow-blue"
              }`}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                {...register("password")}
                className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 text-slate-400 transition hover:text-primary-500"
                tabIndex={-1}
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

          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Secure sign-in
            </div>
            <Link
              to="/forgot-password"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 transition hover:text-primary-700"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid || isSubmitting}
            icon={LogIn}
            iconRight={ArrowRight}
            className="w-full"
          >
            Continue as {selectedRole.label}
          </Button>
        </form>

        <div className="mt-6">
          <div className="divider-labeled text-xs text-slate-400">or continue with</div>
          
          <div className="mt-5">
            <button
              type="button"
              onClick={() => toast.success("Google Authentication Initiated")}
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-200"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Sign in with Google
            </button>
          </div>

          <p className="mt-6 text-center text-sm text-slate-600">
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
      </motion.div>
    </div>
  );
}
