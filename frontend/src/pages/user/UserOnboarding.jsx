import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { 
  User, Users, HeartPulse, WalletCards, ShieldCheck, 
  ArrowRight, ArrowLeft, CheckCircle2 
} from "lucide-react";
import { 
  Button, Input, Select, ProgressStepper, FormSection, 
  ToggleSwitch, CheckboxGroup, Textarea 
} from "../../components/common";
import {
  onboardingDefaults,
  onboardingSchema,
  onboardingStepFields,
} from "../../validation";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";

const STEPS = [
  { key: "personal", label: "Personal", icon: User },
  { key: "family", label: "Family", icon: Users },
  { key: "health", label: "Health", icon: HeartPulse },
  { key: "financial", label: "Financial", icon: WalletCards },
  { key: "insurance", label: "Insurance", icon: ShieldCheck },
];

export default function UserOnboarding() {
  const navigate = useNavigate();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [submissionError, setSubmissionError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    trigger,
    getFieldState,
    formState: { errors, isValid, isSubmitting, submitCount },
  } = useForm({
    resolver: zodResolver(onboardingSchema),
    defaultValues: onboardingDefaults,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useScrollToFirstError(errors, submitCount);

  const handleNext = async () => {
    const fieldsToValidate = onboardingStepFields[currentStepIndex];
    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStepIndex((prev) => Math.min(prev + 1, STEPS.length - 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      toast.error("Please fix the errors before continuing.");
      const firstInvalidField = fieldsToValidate.find(
        (fieldName) => getFieldState(fieldName).error,
      );
      if (firstInvalidField) {
        const target = document.querySelector(`[name="${firstInvalidField}"]`);
        target?.scrollIntoView({ behavior: "smooth", block: "center" });
        target?.focus();
      }
    }
  };

  const handlePrev = () => {
    setCurrentStepIndex((prev) => Math.max(prev - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const onSubmit = async (data) => {
    setSubmissionError("");
    try {
      // Mock API call
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Onboarding Data:", data);
      toast.success("Profile creation complete!");
      navigate("/dashboard");
    } catch {
      setSubmissionError("Failed to complete onboarding. Please try again.");
      toast.error("Failed to complete onboarding.");
    }
  };

  const currentStep = STEPS[currentStepIndex];

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Configure Your Profile</h1>
          <p className="mt-2 text-slate-500">Provide details so our AI can accurately tailor recommendations.</p>
        </div>

        <div className="mb-8 rounded-2xl bg-white p-4 shadow-sm border border-slate-200">
          <ProgressStepper steps={STEPS} currentStep={currentStep.key} />
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8" noValidate>
          <AnimatePresence>
            {submissionError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                role="alert"
              >
                {submissionError}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.key}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {currentStepIndex === 0 && (
                <FormSection title="Personal Information" description="Basic demographic data for policy eligibility." icon={User}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input label="Full Name" placeholder="John Doe" required error={errors.fullName?.message} {...register("fullName")} className="sm:col-span-2" />
                    <Input label="Age" type="number" required error={errors.age?.message} {...register("age")} />
                    <Select label="Gender" required error={errors.gender?.message} {...register("gender")}>
                      <option value="">Select...</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Select>
                    <Select label="Marital Status" required error={errors.maritalStatus?.message} {...register("maritalStatus")}>
                      <option value="">Select...</option>
                      <option value="single">Single</option>
                      <option value="married">Married</option>
                      <option value="divorced">Divorced</option>
                    </Select>
                    <Input label="Occupation" placeholder="Software Engineer" required error={errors.occupation?.message} {...register("occupation")} />
                    <Input label="City" placeholder="Mumbai" required error={errors.city?.message} {...register("city")} />
                    <Input label="State" placeholder="Maharashtra" required error={errors.state?.message} {...register("state")} />
                  </div>
                </FormSection>
              )}

              {currentStepIndex === 1 && (
                <FormSection title="Family Information" description="Important for floater policies and life term sizing." icon={Users}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input label="Number of Dependents" type="number" required error={errors.dependents?.message} {...register("dependents")} />
                    <div className="flex items-end">
                      <Controller
                        name="spouseWorking"
                        control={control}
                        render={({ field }) => (
                          <ToggleSwitch 
                            label="Spouse Working?" 
                            description="Used to calculate joint income."
                            checked={field.value} 
                            onChange={field.onChange} 
                          />
                        )}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Controller
                        name="childrenAgeGroup"
                        control={control}
                        render={({ field }) => (
                          <CheckboxGroup
                            label="Children Age Groups (Optional)"
                            options={[
                              { label: "0-5 Years", value: "toddler" },
                              { label: "6-12 Years", value: "child" },
                              { label: "13-18 Years", value: "teen" },
                              { label: "18+ Years", value: "adult" },
                            ]}
                            columns={2}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <Textarea 
                      label="Family Medical History (Optional)" 
                      placeholder="List any hereditary conditions..." 
                      {...register("familyMedicalHistory")} 
                      className="sm:col-span-2" 
                    />
                  </div>
                </FormSection>
              )}

              {currentStepIndex === 2 && (
                <FormSection title="Health Information" description="Crucial for health and life insurance premium calculation." icon={HeartPulse}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Select label="Smoking Status" required error={errors.smokingStatus?.message} {...register("smokingStatus")}>
                      <option value="">Select...</option>
                      <option value="non-smoker">Non Smoker</option>
                      <option value="occasional">Occasional</option>
                      <option value="regular">Regular Smoker</option>
                    </Select>
                    <Select label="Alcohol Consumption" required error={errors.alcoholConsumption?.message} {...register("alcoholConsumption")}>
                      <option value="">Select...</option>
                      <option value="none">None</option>
                      <option value="occasional">Occasional</option>
                      <option value="regular">Regular</option>
                    </Select>
                    <Input label="BMI" type="number" step="0.1" required error={errors.bmi?.message} {...register("bmi")} />
                    <Select label="Lifestyle Category" required error={errors.lifestyleCategory?.message} {...register("lifestyleCategory")}>
                      <option value="">Select...</option>
                      <option value="sedentary">Sedentary (Desk Job)</option>
                      <option value="active">Active</option>
                      <option value="highly-active">Highly Active (Athlete)</option>
                    </Select>
                    <div className="sm:col-span-2">
                      <Controller
                        name="preExistingDiseases"
                        control={control}
                        render={({ field }) => (
                          <CheckboxGroup
                            label="Pre-existing Diseases (if any)"
                            options={[
                              { label: "Diabetes", value: "diabetes" },
                              { label: "Hypertension", value: "hypertension" },
                              { label: "Asthma", value: "asthma" },
                              { label: "Thyroid", value: "thyroid" },
                            ]}
                            columns={2}
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </div>
                    <Textarea 
                      label="Past Surgeries (Optional)" 
                      placeholder="List any past surgeries..." 
                      {...register("pastSurgeries")} 
                      className="sm:col-span-2" 
                    />
                  </div>
                </FormSection>
              )}

              {currentStepIndex === 3 && (
                <FormSection title="Financial Information" description="Helps find policies that fit your affordability." icon={WalletCards}>
                  <div className="grid gap-6 sm:grid-cols-2">
                    <Input label="Annual Income (₹)" type="number" required error={errors.annualIncome?.message} {...register("annualIncome")} />
                    <Input label="Monthly Expenses (₹)" type="number" required error={errors.monthlyExpenses?.message} {...register("monthlyExpenses")} />
                    <Input label="Total Savings (₹)" type="number" required error={errors.savingsAmount?.message} {...register("savingsAmount")} />
                    <Input label="Preferred Annual Premium Budget (₹)" type="number" required error={errors.preferredPremium?.message} {...register("preferredPremium")} />
                    <Input label="Ideal Coverage Amount (₹)" type="number" required error={errors.preferredCoverage?.message} {...register("preferredCoverage")} />
                    <Select label="Risk Appetite" required error={errors.riskAppetite?.message} {...register("riskAppetite")}>
                      <option value="">Select...</option>
                      <option value="conservative">Conservative</option>
                      <option value="moderate">Moderate</option>
                      <option value="aggressive">Aggressive</option>
                    </Select>
                  </div>
                </FormSection>
              )}

              {currentStepIndex === 4 && (
                <FormSection title="Insurance Goals" description="Your expectations from this platform." icon={ShieldCheck}>
                   <div className="grid gap-6 sm:grid-cols-2">
                      <Textarea 
                        label="Existing Policies" 
                        placeholder="E.g., LIC Jeevan Anand, Max Bupa Health..." 
                        {...register("existingPolicies")} 
                        className="sm:col-span-2" 
                      />
                      <Input label="Preferred Insurer (Optional)" placeholder="E.g., HDFC Ergo" {...register("preferredInsurer")} />
                      <div className="flex items-end">
                        <Controller
                          name="previousClaims"
                          control={control}
                          render={({ field }) => (
                            <ToggleSwitch 
                              label="Have you ever filed a claim?" 
                              checked={field.value} 
                              onChange={field.onChange} 
                            />
                          )}
                        />
                      </div>
                      <Textarea 
                        label="Primary Policy Goal" 
                        placeholder="E.g., Protect my family financially in my absence." 
                        required
                        error={errors.policyGoal?.message}
                        {...register("policyGoal")} 
                        className="sm:col-span-2" 
                      />
                   </div>
                </FormSection>
              )}
            </motion.div>
          </AnimatePresence>

          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200">
            <Button 
               type="button" 
               variant="secondary" 
               onClick={handlePrev} 
               disabled={currentStepIndex === 0 || isSubmitting}
               icon={ArrowLeft}
            >
              Back
            </Button>
            
            {currentStepIndex < STEPS.length - 1 ? (
              <Button type="button" onClick={handleNext} disabled={isSubmitting} iconRight={ArrowRight}>
                Continue
              </Button>
            ) : (
              <Button
                type="submit"
                loading={isSubmitting}
                disabled={!isValid || isSubmitting}
                icon={CheckCircle2}
                variant="primary"
              >
                Complete Onboarding
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
