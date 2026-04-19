import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  Building2,
  ShieldPlus,
  IndianRupee,
  Star,
  AlertTriangle,
  ArrowLeft,
  Check,
} from "lucide-react";
import { Button, Input, Select, FormSection, ToggleSwitch, Textarea } from "../../components/common";
import { createPolicy, getAdminPolicies, updatePolicy } from "../../services/adminService";
import { useScrollToFirstError } from "../../hooks/useScrollToFirstError";
import {
  buildPolicyPayload,
  mapPolicyToAdminForm,
  planTypeOptions,
  policyAdminDefaults,
  policyAdminSchema,
  policyCategoryOptions,
} from "../../validation";

export default function AdminPolicyForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [isBootstrapping, setIsBootstrapping] = useState(isEditing);
  const [loadError, setLoadError] = useState("");
  const [submissionError, setSubmissionError] = useState("");

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting, isValid, submitCount, isDirty },
  } = useForm({
    resolver: zodResolver(policyAdminSchema),
    defaultValues: policyAdminDefaults,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useScrollToFirstError(errors, submitCount);

  useEffect(() => {
    if (!isEditing) {
      setIsBootstrapping(false);
      return;
    }

    let cancelled = false;

    async function bootstrapEditForm() {
      setIsBootstrapping(true);
      setLoadError("");
      try {
        const allPolicies = await getAdminPolicies();
        const policy = (allPolicies || []).find(
          (item) => item?._id === id || item?.policyId === id || item?.id === id,
        );

        if (!policy) {
          setLoadError("Policy not found. It may have been removed.");
          return;
        }

        if (!cancelled) {
          reset(mapPolicyToAdminForm(policy));
        }
      } catch {
        if (!cancelled) {
          setLoadError("Failed to load policy details. Please refresh and try again.");
        }
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    bootstrapEditForm();

    return () => {
      cancelled = true;
    };
  }, [id, isEditing, reset]);

  const onSubmit = async (values) => {
    if (isSubmitting) return;

    setSubmissionError("");
    try {
      const payload = buildPolicyPayload(values);

      if (isEditing) {
        await updatePolicy(id, payload);
      } else {
        await createPolicy(payload);
      }

      toast.success(
        isEditing ? "Policy updated successfully." : "Policy created successfully.",
      );
      navigate("/admin/policies");
    } catch (error) {
      const message = error?.response?.data?.message || "Failed to save policy data.";
      setSubmissionError(message);
      toast.error(message);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="bg-slate-50 min-h-screen py-8">
        <div className="max-w-5xl mx-auto px-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="skeleton-title mb-4" />
            <div className="space-y-3">
              <div className="skeleton h-10 w-full rounded-xl" />
              <div className="skeleton h-10 w-full rounded-xl" />
              <div className="skeleton h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8">
      <div className="max-w-5xl mx-auto px-4">
        <div className="mb-6 flex items-center gap-4">
          <button
            type="button"
            onClick={() => navigate("/admin/policies")}
            className="p-2 border border-slate-200 rounded-xl bg-white hover:bg-slate-100 transition-all text-slate-500"
            aria-label="Back to policies"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEditing ? "Edit Policy Configuration" : "Deploy New Policy"}
            </h1>
            <p className="text-sm text-slate-500">
              Structured catalog entry for the AI recommendation engine.
            </p>
          </div>
        </div>

        {loadError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {submissionError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {submissionError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
          <FormSection
            title="1. Policy Basics"
            description="Identity and overarching categorization matrix."
            icon={Building2}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Policy Name"
                required
                error={errors.name?.message}
                {...register("name")}
              />
              <Input
                label="Insurer Name"
                required
                error={errors.company?.message}
                {...register("company")}
              />
              <Select
                label="Policy Category"
                required
                error={errors.category?.message}
                {...register("category")}
              >
                {policyCategoryOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Select
                label="Plan Type"
                required
                error={errors.planType?.message}
                {...register("planType")}
              >
                {planTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
              <Textarea
                label="Short Description (Optional)"
                placeholder="Short policy summary shown in cards and detail pages."
                error={errors.description?.message}
                {...register("description")}
                className="sm:col-span-2"
              />
            </div>
          </FormSection>

          <FormSection
            title="2. Coverage Details"
            description="Core structural parameters for recommendation calculations."
            icon={ShieldPlus}
          >
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              <Input
                label="Coverage Amount (₹)"
                type="number"
                required
                error={errors.coverage?.message}
                {...register("coverage")}
                className="lg:col-span-3"
              />
              <Input
                label="Min Entry Age"
                type="number"
                error={errors.minEntryAge?.message}
                {...register("minEntryAge")}
              />
              <Input
                label="Max Entry Age"
                type="number"
                error={errors.maxEntryAge?.message}
                {...register("maxEntryAge")}
              />
              <Input
                label="Waiting Period (Days)"
                type="number"
                error={errors.waitingPeriodDays?.message}
                {...register("waitingPeriodDays")}
              />
              <Input
                label="Network Hospitals Count"
                type="number"
                error={errors.networkCount?.message}
                {...register("networkCount")}
              />
              <Input
                label="Room Rent Limit"
                placeholder="e.g., Single Private AC"
                error={errors.roomRentLimit?.message}
                {...register("roomRentLimit")}
                className="sm:col-span-2"
              />
              <Select
                label="Coverage Tier"
                required
                error={errors.coverageType?.message}
                {...register("coverageType")}
                className="lg:col-span-3"
              >
                <option value="basic">Basic Value</option>
                <option value="comprehensive">Comprehensive</option>
                <option value="premium">Premium Ultra</option>
              </Select>

              <div className="lg:col-span-3 grid gap-4 border-t border-slate-100 pt-5 mt-2 sm:grid-cols-2 lg:grid-cols-3">
                <Controller
                  name="familyFloaterSupported"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      label="Family Floater?"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  )}
                />
                <Controller
                  name="maternityCover"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      label="Maternity Cover?"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  )}
                />
                <Controller
                  name="criticalIllnessCover"
                  control={control}
                  render={({ field }) => (
                    <ToggleSwitch
                      label="Critical Illness?"
                      checked={field.value}
                      onChange={(event) => field.onChange(event.target.checked)}
                    />
                  )}
                />
              </div>
            </div>
          </FormSection>

          <FormSection
            title="3. Pricing Metrics"
            description="Base pricing matrices before dynamic age multipliers."
            icon={IndianRupee}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Base Premium (₹)"
                type="number"
                required
                error={errors.price?.message}
                {...register("price")}
              />
              <Select
                label="Frequency"
                required
                error={errors.premiumFrequency?.message}
                {...register("premiumFrequency")}
              >
                <option value="monthly">Monthly</option>
                <option value="quarterly">Quarterly</option>
                <option value="annually">Annually</option>
              </Select>
              <Input
                label="Deductible (₹)"
                type="number"
                error={errors.deductible?.message}
                {...register("deductible")}
              />
              <Input
                label="Co-pay Percentage (%)"
                type="number"
                error={errors.copayPercentage?.message}
                {...register("copayPercentage")}
              />
            </div>
          </FormSection>

          <FormSection
            title="4. Reliability & Trust Scores"
            description="Verified IRDAI or insurer data used for recommendations."
            icon={Star}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Claim Settlement Ratio (%)"
                type="number"
                step="0.01"
                required
                error={errors.claimSettlementRatio?.message}
                {...register("claimSettlementRatio")}
              />
              <Input
                label="Incurred Claim Ratio (%)"
                type="number"
                step="0.01"
                required
                error={errors.incurredClaimRatio?.message}
                {...register("incurredClaimRatio")}
              />
              <Input
                label="Customer Rating (/5)"
                type="number"
                step="0.1"
                required
                error={errors.ratingAverage?.message}
                {...register("ratingAverage")}
              />
              <Input
                label="Insurer Support Score (/100)"
                type="number"
                required
                error={errors.insurerSupportScore?.message}
                {...register("insurerSupportScore")}
              />
            </div>
          </FormSection>

          <FormSection
            title="5. Exclusions & Add-ons"
            description="Structured fields for AI extraction and customer transparency."
            icon={AlertTriangle}
          >
            <div className="space-y-5">
              <Textarea
                label="Exclusions List"
                placeholder="List comma-separated exclusions..."
                error={errors.exclusionsList?.message}
                {...register("exclusionsList")}
              />
              <Input
                label="Pre-Existing Waiting Period (Years)"
                type="number"
                error={errors.preExistingDiseaseWaitingPeriod?.message}
                {...register("preExistingDiseaseWaitingPeriod")}
              />
              <Textarea
                label="Hidden Charges Note"
                placeholder="Any specific sub-limits explicitly stated..."
                error={errors.hiddenChargesNote?.message}
                {...register("hiddenChargesNote")}
              />
              <Textarea
                label="Add-on Benefits"
                placeholder="List comma-separated super top-ups/riders..."
                error={errors.addOnBenefits?.message}
                {...register("addOnBenefits")}
              />
              <Textarea
                label="No Claim Bonus Details"
                placeholder="NCB structuring scale..."
                error={errors.noClaimBonusDetails?.message}
                {...register("noClaimBonusDetails")}
              />
            </div>
          </FormSection>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end pt-5 mb-10">
            <Button
              type="button"
              variant="ghost"
              onClick={() => navigate("/admin/policies")}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting || !isValid || (!isDirty && !isEditing)}
              icon={Check}
              size="lg"
            >
              {isEditing ? "Update Policy" : "Create & Deploy Policy"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
