import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  UserPlus, Mail, Lock, ArrowRight, ArrowLeft, Phone, Calendar,
  User as UserIcon, Briefcase, Users, CheckCircle2,
  Eye, EyeOff, Activity, MapPin, IndianRupee, ShieldCheck
} from "lucide-react";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { Button, Input, Select, ProgressStepper } from "../../components/common";
import { registerSchema } from "../../validation";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";

const STEPS = [
  { key: "account", label: "Account", icon: UserPlus },
  { key: "personal", label: "Personal", icon: UserIcon },
  { key: "professional", label: "Professional", icon: Briefcase }
];

const fadeVariant = {
  hidden: { opacity: 0, x: 20 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -20, transition: { duration: 0.2 } }
};

const fieldsByStep = [
  ['fullName', 'email', 'mobileNumber', 'password'],
  ['dateOfBirth', 'gender', 'maritalStatus', 'city', 'state', 'pincode'],
  ['employmentType', 'occupation', 'annualIncome']
];

export default function Register() {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting, submitCount }
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "", email: "", mobileNumber: "", password: "",
      dateOfBirth: "", gender: "", maritalStatus: "", city: "", state: "", pincode: "",
      occupation: "", employmentType: "", annualIncome: ""
    },
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useScrollToFirstError(errors, submitCount);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentStepIndex]);

  const handleNext = async () => {
    const fieldsToValidate = fieldsByStep[currentStepIndex];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStepIndex((p) => Math.min(p + 1, STEPS.length - 1));
    }
  };

  const handleBack = () => {
    setCurrentStepIndex((p) => Math.max(p - 1, 0));
  };

  const calculateProgress = () => {
    return Math.round(((currentStepIndex + 1) / STEPS.length) * 100);
  };

  const onSubmit = async (data) => {
    try {
      await registerAuth(data);
      setIsSuccess(true);
      toast.success("Account created successfully!");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed");
    }
  };

  const renderStepContent = () => {
    switch (currentStepIndex) {
      case 0:
        return (
          <div className="space-y-4">
            <Input label="Full Name" icon={UserPlus} placeholder="FullName" {...register("fullName")} error={errors.fullName?.message} />
            <Input label="Email Address" icon={Mail} type="email" placeholder="your@example.com" {...register("email")} error={errors.email?.message} />
            <Input label="Mobile Number" icon={Phone} type="tel" placeholder="10-digit mobile number" {...register("mobileNumber")} error={errors.mobileNumber?.message} />
            <div>
              <label className="field-label">
                <Lock className="mr-1 inline h-4 w-4 text-primary-500" />
                Password
              </label>
              <div className={`group flex items-center gap-3 rounded-btn border-2 bg-white px-4 py-3 transition-all ${errors.password ? "border-red-400" : "border-slate-200 focus-within:border-primary-500 focus-within:shadow-glow-blue"}`}>
                <input type={showPassword ? "text" : "password"} placeholder="••••••••" {...register("password")} className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400" />
                <button type="button" onClick={() => setShowPassword((p) => !p)} className="shrink-0 text-slate-400 transition hover:text-primary-500" tabIndex={-1}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.password && <p className="field-error-text" role="alert">{errors.password.message}</p>}
            </div>
          </div>
        );
      case 1:
        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Date of Birth" icon={Calendar} type="date" {...register("dateOfBirth")} error={errors.dateOfBirth?.message} />
              <Select label="Gender" icon={UserIcon} {...register("gender")} error={errors.gender?.message}>
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </Select>
            </div>
            <Select label="Marital Status" icon={Users} {...register("maritalStatus")} error={errors.maritalStatus?.message}>
              <option value="">Select Status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Divorced">Divorced</option>
              <option value="Widowed">Widowed</option>
            </Select>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="City" icon={MapPin} placeholder="Ahmedabad" {...register("city")} error={errors.city?.message} />
              <Input label="State" icon={MapPin} placeholder="Gujarat" {...register("state")} />
            </div>
            <Input label="Pincode" icon={MapPin} placeholder="380001" {...register("pincode")} />
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <Select label="Employment Type" icon={Briefcase} {...register("employmentType")}>
              <option value="">Select Type</option>
              <option value="Salaried">Salaried</option>
              <option value="Self-employed">Self-employed</option>
              <option value="Business">Business</option>
              <option value="Student">Student</option>
            </Select>
            <Input label="Occupation" icon={Activity} placeholder="e.g. Software Engineer" {...register("occupation")} error={errors.occupation?.message} />
            <Input label="Annual Income (₹)" icon={IndianRupee} type="number" placeholder="500000" {...register("annualIncome")} error={errors.annualIncome?.message} />
          </div>
        );
      default:
        return null;
    }
  };

  if (isSuccess) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center p-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md text-center glass-panel p-10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100">
            <CheckCircle2 className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Profile Complete!</h2>
          <p className="mt-2 text-slate-500">Your personalized insurance dashboard is ready.</p>
          <Button onClick={() => navigate("/")} className="mt-8 w-full" iconRight={ArrowRight}>
            Go to Dashboard
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[85vh] flex-col items-center justify-center py-10 px-4 sm:px-6 relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-96 w-96 animate-glow-left rounded-full bg-gradient-to-br from-primary-400/20 to-violet-400/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 animate-glow-right rounded-full bg-gradient-to-br from-cyan-400/15 to-blue-400/15 blur-3xl" />
      </div>

      <div className="w-full max-w-2xl z-10">
        <div className="text-center mb-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 shadow-xl shadow-primary-500/25">
            <ShieldCheck className="h-7 w-7 text-white" />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-tight text-slate-900">
            Smart Onboarding
          </h1>
          <p className="mt-2 text-slate-500">
            Let's personalize your InsureAI experience in a few quick steps.
          </p>
        </div>

        <div className="glass-panel p-4 sm:p-10 shadow-xl shadow-slate-200/50 overflow-hidden relative">
          <div className="mb-8">
            <ProgressStepper steps={STEPS} currentStep={STEPS[currentStepIndex].key} className="justify-center sm:justify-between" />
            <div className="mt-6 flex items-center gap-3">
              <div className="h-1.5 flex-1 rounded-full bg-slate-100 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${calculateProgress()}%` }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-500 w-8">{calculateProgress()}%</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="min-h-[360px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepIndex}
                  variants={fadeVariant}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                >
                  <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-100 text-primary-600">
                      {(() => {
                        const Icon = STEPS[currentStepIndex].icon;
                        return <Icon className="h-4 w-4" />;
                      })()}
                    </span>
                    {STEPS[currentStepIndex].label} Profile
                  </h2>

                  {renderStepContent()}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-10 flex items-center justify-between border-t border-slate-100 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={currentStepIndex === 0 || isSubmitting}
                className={currentStepIndex === 0 ? "opacity-0 invisible pointer-events-none" : ""}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              {currentStepIndex < STEPS.length - 1 ? (
                <Button type="button" onClick={handleNext} disabled={isSubmitting} iconRight={ArrowRight}>
                  Next Step
                </Button>
              ) : (
                <Button type="submit" loading={isSubmitting} disabled={isSubmitting} iconRight={ArrowRight}>
                  Complete Profile
                </Button>
              )}
            </div>
          </form>
        </div>

        <p className="mt-8 text-center text-sm text-slate-500">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
