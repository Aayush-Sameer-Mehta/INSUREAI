import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, ShieldCheck, Heart, Home, Car, SlidersHorizontal, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  Button, FormSection, OptionCardSelector, ToggleSwitch, RadioGroup 
} from "../../components/common";
import {
  insurancePreferencesDefaults,
  insurancePreferencesSchema,
} from "../../validation";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";

const MOCK_CATEGORIES = [
  { value: "health", label: "Health Cover", description: "Medical emergencies and hospitalization", icon: Heart },
  { value: "life", label: "Life Insurance", description: "Term life and family protection", icon: ShieldCheck },
  { value: "vehicle", label: "Auto Insurance", description: "Car and two-wheeler protection", icon: Car },
  { value: "property", label: "Property Cover", description: "Home and business asset protection", icon: Home },
];

export default function InsurancePreferences() {
  const [submissionError, setSubmissionError] = useState("");
  const [submissionSuccess, setSubmissionSuccess] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting, submitCount, isDirty },
  } = useForm({
    resolver: zodResolver(insurancePreferencesSchema),
    defaultValues: insurancePreferencesDefaults,
    mode: "onBlur",
    reValidateMode: "onChange",
  });

  useScrollToFirstError(errors, submitCount);

  const handleSave = async (values) => {
    setSubmissionError("");
    setSubmissionSuccess(false);
    try {
      await new Promise(res => setTimeout(res, 1200));
      console.log("Saved preferences:", values);
      setSubmissionSuccess(true);
      toast.success("Preferences updated! Recommendations refined.");
    } catch {
      setSubmissionError("Unable to save your preferences right now. Please try again.");
      toast.error("Failed to save preferences.");
    } finally {
      window.setTimeout(() => setSubmissionSuccess(false), 2200);
    }
  };

  return (
    <div className="page-shell max-w-5xl mx-auto space-y-8">
      <div className="text-center max-w-2xl mx-auto">
        <h1 className="text-3xl font-display font-bold text-slate-900 tracking-tight">Recommendation Engine Preferences</h1>
        <p className="mt-2 text-slate-500">Fine-tune the weights our AI uses when scoring and sorting policies for your personalized dashboard.</p>
      </div>

      <FormSection title="Primary Category" description="Which insurance product are you actively looking for?" icon={ShieldCheck}>
        <Controller
          name="primaryCategory"
          control={control}
          render={({ field }) => (
            <OptionCardSelector
              options={MOCK_CATEGORIES}
              value={field.value}
              onChange={field.onChange}
              columns={2}
              error={errors.primaryCategory?.message}
            />
          )}
        />
      </FormSection>

      <FormSection title="Cost vs Coverage Optimization" description="How should the AI prioritize policy results?" icon={SlidersHorizontal}>
        <Controller
          name="priority"
          control={control}
          render={({ field }) => (
            <div>
              <div className="grid sm:grid-cols-3 gap-4">
                {[
                  { id: "low-premium", label: "Budget Focused", desc: "Prioritize lower monthly premiums over high coverage limits.", color: "text-emerald-600" },
                  { id: "balanced", label: "Balanced Value", desc: "Optimal mix of affordable premiums and fair coverage.", color: "text-blue-600" },
                  { id: "high-coverage", label: "Maximum Protection", desc: "Premium cost is secondary to comprehensive coverage and high sum insured.", color: "text-violet-600" },
                ].map(opt => {
                  const active = field.value === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => field.onChange(opt.id)}
                      className={`relative text-left p-5 rounded-[20px] transition-all border-2 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary-100 ${active ? "border-primary-500 bg-primary-50" : "border-slate-100 bg-white hover:border-slate-200"}`}
                    >
                      {active && <Check className="absolute top-4 right-4 h-5 w-5 text-primary-500" />}
                      <p className={`font-bold ${active ? opt.color : "text-slate-900"}`}>{opt.label}</p>
                      <p className={`mt-2 text-xs leading-relaxed ${active ? "text-primary-800/80" : "text-slate-500"}`}>{opt.desc}</p>
                    </button>
                  );
                })}
              </div>
              {errors.priority?.message && (
                <p className="mt-2 text-xs font-medium text-red-600 animate-fade-in-up">
                  {errors.priority.message}
                </p>
              )}
            </div>
          )}
        />
      </FormSection>

      <form onSubmit={handleSubmit(handleSave)} noValidate>
        <FormSection title="Specific Add-ons" description="Required endorsements that filter out incompatible policies." icon={PlusCircle}>
          <div className="grid sm:grid-cols-2 gap-6">
            <Controller
              name="maternityCover"
              control={control}
              render={({ field }) => (
                <ToggleSwitch
                  label="Require Maternity Cover"
                  description="Filter out health policies that do not cover maternity."
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
              )}
            />
            <Controller
              name="criticalIllness"
              control={control}
              render={({ field }) => (
                <ToggleSwitch
                  label="Require Critical Illness Rider"
                  description="Ensure term or health policies have critical illness coverage."
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                />
              )}
            />
            <div className="sm:col-span-2 border rounded-xl p-5 border-slate-200">
              <Controller
                name="waitingPeriodTolerance"
                control={control}
                render={({ field }) => (
                  <RadioGroup
                    label="Waiting Period Tolerance (Pre-existing diseases)"
                    options={[
                      { label: "0-1 Years (Higher premium)", value: "short" },
                      { label: "2-3 Years (Balanced)", value: "medium" },
                      { label: "4+ Years (Cheaper premium)", value: "strict" }
                    ]}
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.waitingPeriodTolerance?.message}
                  />
                )}
              />
            </div>
          </div>
        </FormSection>

        <AnimatePresence>
          {submissionError && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {submissionError}
            </motion.p>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {submissionSuccess && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
            >
              Preferences saved successfully.
            </motion.p>
          )}
        </AnimatePresence>

        <div className="flex justify-end pt-4">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={!isValid || isSubmitting || !isDirty}
            icon={Check}
            size="lg"
          >
            Save Engine Preferences
          </Button>
        </div>
      </form>
    </div>
  );
}
