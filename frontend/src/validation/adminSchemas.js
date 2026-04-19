import { z } from "zod";
import {
  optionalNumber,
  optionalText,
  requiredNumber,
  requiredSelect,
  requiredText,
  splitCommaSeparated,
} from "./patterns";

export const policyCategoryOptions = [
  { value: "health", label: "Health Insurance" },
  { value: "life", label: "Life Insurance" },
  { value: "car", label: "Car Insurance" },
  { value: "travel", label: "Travel Insurance" },
  { value: "home", label: "Property Insurance" },
  { value: "business", label: "Business Insurance" },
  { value: "personal_accident", label: "Personal Accident" },
  { value: "group", label: "Group Insurance" },
];

export const planTypeOptions = [
  { value: "individual", label: "Individual Plan" },
  { value: "family_floater", label: "Family Floater" },
  { value: "group", label: "Group/Corporate" },
];

export const policyAdminSchema = z
  .object({
    name: requiredText("Policy name", 5, 120),
    company: requiredText("Insurer name", 2, 120),
    category: requiredSelect("Policy category"),
    planType: z.enum(["individual", "family_floater", "group"], {
      required_error: "Select plan type",
    }),

    coverage: requiredNumber("Coverage amount", {
      min: 10000,
      max: 1000000000,
      integer: true,
    }),
    minEntryAge: requiredNumber("Min entry age", { min: 0, max: 100, integer: true }),
    maxEntryAge: requiredNumber("Max entry age", { min: 0, max: 100, integer: true }),
    waitingPeriodDays: requiredNumber("Waiting period", {
      min: 0,
      max: 3650,
      integer: true,
    }),
    networkCount: optionalNumber("Network hospitals count", {
      min: 0,
      max: 200000,
      integer: true,
    }),
    coverageType: z.enum(["comprehensive", "basic", "premium"], {
      required_error: "Select coverage tier",
    }),
    familyFloaterSupported: z.boolean().default(false),
    roomRentLimit: optionalText(150),
    maternityCover: z.boolean().default(false),
    criticalIllnessCover: z.boolean().default(false),

    price: requiredNumber("Base premium", {
      min: 100,
      max: 100000000,
      integer: true,
    }),
    deductible: optionalNumber("Deductible", { min: 0, max: 100000000 }),
    copayPercentage: optionalNumber("Co-pay percentage", { min: 0, max: 100 }),
    premiumFrequency: z.enum(["monthly", "quarterly", "annually"], {
      required_error: "Select premium frequency",
    }),

    claimSettlementRatio: requiredNumber("Claim settlement ratio", {
      min: 0,
      max: 100,
    }),
    incurredClaimRatio: requiredNumber("Incurred claim ratio", { min: 0, max: 150 }),
    ratingAverage: requiredNumber("Customer rating", { min: 0, max: 5 }),
    insurerSupportScore: requiredNumber("Insurer support score", {
      min: 0,
      max: 100,
    }),

    exclusionsList: optionalText(1200),
    preExistingDiseaseWaitingPeriod: requiredNumber(
      "Pre-existing disease waiting period",
      { min: 0, max: 30 },
    ),
    hiddenChargesNote: optionalText(1200),
    addOnBenefits: optionalText(1200),
    noClaimBonusDetails: optionalText(1200),
    description: optionalText(1200),
  })
  .superRefine((data, ctx) => {
    if (data.maxEntryAge < data.minEntryAge) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["maxEntryAge"],
        message: "Max entry age must be greater than or equal to min entry age",
      });
    }

    const supportedCategories = policyCategoryOptions.map((item) => item.value);
    if (!supportedCategories.includes(data.category)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["category"],
        message: "Select a valid policy category",
      });
    }
  });

export const policyAdminDefaults = {
  name: "",
  company: "",
  category: "health",
  planType: "individual",
  coverage: "",
  minEntryAge: 18,
  maxEntryAge: 65,
  waitingPeriodDays: "",
  networkCount: "",
  coverageType: "comprehensive",
  familyFloaterSupported: false,
  roomRentLimit: "",
  maternityCover: false,
  criticalIllnessCover: false,
  price: "",
  deductible: "",
  copayPercentage: "",
  premiumFrequency: "annually",
  claimSettlementRatio: "",
  incurredClaimRatio: "",
  ratingAverage: "",
  insurerSupportScore: "",
  exclusionsList: "",
  preExistingDiseaseWaitingPeriod: "",
  hiddenChargesNote: "",
  addOnBenefits: "",
  noClaimBonusDetails: "",
  description: "",
};

function findCoverageDetail(coverageDetails, label) {
  const match = (coverageDetails || []).find((item) => item?.label === label);
  return match?.value || "";
}

export function mapPolicyToAdminForm(policy) {
  const premiumInfo = policy?.premiumInfo || {};
  const financialTerms = policy?.financialTerms || {};

  return {
    name: policy?.name || "",
    company: policy?.company || "",
    category: policy?.category || "health",
    planType: findCoverageDetail(policy?.coverageDetails, "Plan type") || "individual",
    coverage: policy?.coverage ?? "",
    minEntryAge: Number(findCoverageDetail(policy?.coverageDetails, "Min entry age")) || 18,
    maxEntryAge: Number(findCoverageDetail(policy?.coverageDetails, "Max entry age")) || 65,
    waitingPeriodDays: policy?.waitingPeriodDays ?? "",
    networkCount: policy?.networkCount ?? "",
    coverageType: policy?.subtype || "comprehensive",
    familyFloaterSupported:
      findCoverageDetail(policy?.coverageDetails, "Family floater supported") === "yes",
    roomRentLimit: findCoverageDetail(policy?.coverageDetails, "Room rent limit") || "",
    maternityCover:
      findCoverageDetail(policy?.coverageDetails, "Maternity cover") === "yes",
    criticalIllnessCover:
      findCoverageDetail(policy?.coverageDetails, "Critical illness cover") === "yes",
    price: policy?.price ?? "",
    deductible: financialTerms?.deductible ?? "",
    copayPercentage: financialTerms?.copayPercentage ?? "",
    premiumFrequency:
      premiumInfo?.paymentOptions === "monthly" ||
      premiumInfo?.paymentOptions === "quarterly"
        ? premiumInfo.paymentOptions
        : "annually",
    claimSettlementRatio: policy?.claimSettlementRatio ?? "",
    incurredClaimRatio:
      Number(findCoverageDetail(policy?.coverageDetails, "Incurred claim ratio")) || "",
    ratingAverage: policy?.ratingAverage ?? "",
    insurerSupportScore:
      Number(findCoverageDetail(policy?.coverageDetails, "Insurer support score")) || "",
    exclusionsList: (policy?.termsAndConditions || []).join(", "),
    preExistingDiseaseWaitingPeriod:
      Number(
        findCoverageDetail(policy?.coverageDetails, "Pre-existing disease waiting period"),
      ) || "",
    hiddenChargesNote: premiumInfo?.discounts || "",
    addOnBenefits: (policy?.benefits || []).join(", "),
    noClaimBonusDetails: (policy?.claimProcess || []).join(", "),
    description: policy?.description || "",
  };
}

export function buildPolicyPayload(values) {
  return {
    name: values.name,
    company: values.company,
    category: values.category,
    price: values.price,
    coverage: values.coverage,
    subtype: values.coverageType,
    description: values.description || "",
    benefits: splitCommaSeparated(values.addOnBenefits),
    termsAndConditions: splitCommaSeparated(values.exclusionsList),
    claimProcess: splitCommaSeparated(values.noClaimBonusDetails),
    premiumInfo: {
      basePremium: String(values.price),
      gst: "",
      discounts: values.hiddenChargesNote || "",
      paymentOptions: values.premiumFrequency,
    },
    financialTerms: {
      deductible: values.deductible ?? 0,
      copayPercentage: values.copayPercentage ?? 0,
    },
    claimSettlementRatio: values.claimSettlementRatio,
    ratingAverage: values.ratingAverage,
    waitingPeriodDays: values.waitingPeriodDays,
    networkCount: values.networkCount ?? 0,
    coverageDetails: [
      { label: "Plan type", value: values.planType },
      { label: "Min entry age", value: String(values.minEntryAge) },
      { label: "Max entry age", value: String(values.maxEntryAge) },
      {
        label: "Family floater supported",
        value: values.familyFloaterSupported ? "yes" : "no",
      },
      { label: "Room rent limit", value: values.roomRentLimit || "-" },
      { label: "Maternity cover", value: values.maternityCover ? "yes" : "no" },
      {
        label: "Critical illness cover",
        value: values.criticalIllnessCover ? "yes" : "no",
      },
      { label: "Incurred claim ratio", value: String(values.incurredClaimRatio) },
      { label: "Insurer support score", value: String(values.insurerSupportScore) },
      {
        label: "Pre-existing disease waiting period",
        value: String(values.preExistingDiseaseWaitingPeriod),
      },
    ],
  };
}

