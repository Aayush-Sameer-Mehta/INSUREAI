import { z } from "zod";
import {
  optionalText,
  requiredNumber,
  requiredSelect,
  requiredText,
  textPatterns,
} from "./patterns";

export const onboardingSchema = z.object({
  fullName: requiredText("Full name", 2, 120).refine(
    (value) => textPatterns.personName.test(value),
    "Enter a valid name",
  ),
  age: requiredNumber("Age", { min: 18, max: 100, integer: true }),
  gender: requiredSelect("Gender"),
  maritalStatus: requiredSelect("Marital status"),
  occupation: requiredText("Occupation", 2, 80),
  city: requiredText("City", 2, 60).refine(
    (value) => textPatterns.cityState.test(value),
    "Enter a valid city name",
  ),
  state: requiredText("State", 2, 60).refine(
    (value) => textPatterns.cityState.test(value),
    "Enter a valid state name",
  ),

  dependents: requiredNumber("Dependents", { min: 0, max: 15, integer: true }),
  spouseWorking: z.boolean().default(false),
  childrenAgeGroup: z.array(z.string()).default([]),
  familyMedicalHistory: optionalText(500),

  smokingStatus: z.enum(["non-smoker", "occasional", "regular"], {
    required_error: "Smoking status is required",
  }),
  alcoholConsumption: z.enum(["none", "occasional", "regular"], {
    required_error: "Alcohol consumption is required",
  }),
  preExistingDiseases: z.array(z.string()).default([]),
  pastSurgeries: optionalText(500),
  bmi: requiredNumber("BMI", { min: 10, max: 50 }),
  lifestyleCategory: z.enum(["sedentary", "active", "highly-active"], {
    required_error: "Lifestyle category is required",
  }),

  annualIncome: requiredNumber("Annual income", {
    min: 0,
    max: 1000000000,
    integer: true,
  }),
  monthlyExpenses: requiredNumber("Monthly expenses", {
    min: 0,
    max: 100000000,
    integer: true,
  }),
  savingsAmount: requiredNumber("Savings amount", {
    min: 0,
    max: 1000000000,
    integer: true,
  }),
  preferredPremium: requiredNumber("Preferred premium", {
    min: 0,
    max: 100000000,
    integer: true,
  }),
  preferredCoverage: requiredNumber("Preferred coverage", {
    min: 10000,
    max: 1000000000,
    integer: true,
  }),
  riskAppetite: z.enum(["conservative", "moderate", "aggressive"], {
    required_error: "Risk appetite is required",
  }),

  existingPolicies: optionalText(500),
  previousClaims: z.boolean().default(false),
  preferredInsurer: optionalText(80),
  policyGoal: requiredText("Primary policy goal", 10, 500),
});

export const onboardingDefaults = {
  spouseWorking: false,
  childrenAgeGroup: [],
  preExistingDiseases: [],
  previousClaims: false,
};

export const onboardingStepFields = [
  [
    "fullName",
    "age",
    "gender",
    "maritalStatus",
    "occupation",
    "city",
    "state",
  ],
  ["dependents", "spouseWorking", "childrenAgeGroup", "familyMedicalHistory"],
  [
    "smokingStatus",
    "alcoholConsumption",
    "preExistingDiseases",
    "pastSurgeries",
    "bmi",
    "lifestyleCategory",
  ],
  [
    "annualIncome",
    "monthlyExpenses",
    "savingsAmount",
    "preferredPremium",
    "preferredCoverage",
    "riskAppetite",
  ],
  ["existingPolicies", "previousClaims", "preferredInsurer", "policyGoal"],
];

export const insurancePreferencesSchema = z.object({
  primaryCategory: z.enum(["health", "life", "vehicle", "property"], {
    required_error: "Select a primary category",
  }),
  priority: z.enum(["low-premium", "balanced", "high-coverage"], {
    required_error: "Select an optimization preference",
  }),
  maternityCover: z.boolean().default(false),
  criticalIllness: z.boolean().default(true),
  waitingPeriodTolerance: z.enum(["short", "medium", "strict"], {
    required_error: "Select waiting period tolerance",
  }),
});

export const insurancePreferencesDefaults = {
  primaryCategory: "health",
  priority: "balanced",
  maternityCover: false,
  criticalIllness: true,
  waitingPeriodTolerance: "short",
};

