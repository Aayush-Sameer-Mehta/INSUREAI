import { z } from "zod";

const recommendationCategories = [
  "car",
  "bike",
  "health",
  "life",
  "travel",
  "home",
  "motor_commercial",
  "liability",
  "business",
  "agriculture",
  "micro_social",
  "specialty",
  "personal_accident",
  "group",
];

export const recommendationV2Schema = z.object({
  age: z.number().min(1).max(120),
  income: z.number().nonnegative().optional().default(0),
  familySize: z.number().int().nonnegative().optional().default(0),
  occupation: z.string().optional().default(""),
  riskProfile: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
  budget: z.number().positive().optional(),
  insuranceGoal: z.string().optional().default(""),
  categories: z.array(z.enum(recommendationCategories)).optional().default([]),
  healthConditions: z.array(z.string()).optional().default([]),
  smoking: z.boolean().optional().default(false),
  drivingHistory: z.enum(["good", "average", "poor"]).optional().default("good"),
  claimHistory: z.number().int().nonnegative().optional().default(0),
  coverageAmount: z.number().positive().optional(),
  agentScore: z.number().min(0).max(100).optional().default(0),
});

export const premiumCalculateSchema = z.object({
  basePremium: z.number().nonnegative(),
  coverageAmount: z.number().positive(),
  policyCoverage: z.number().positive(),
  termYears: z.number().int().min(1).max(50).optional().default(1),
  age: z.number().min(1).max(120),
  riskScore: z.number().min(0).max(100),
  smoking: z.boolean().optional().default(false),
  claimHistory: z.number().int().nonnegative().optional().default(0),
  drivingHistory: z.enum(["good", "average", "poor"]).optional().default("good"),
});

export const claimCreateV2Schema = z.object({
  policyId: z.string().min(1),
  userId: z.string().optional(),
  agentId: z.string().optional(),
  agentAssisted: z.boolean().optional().default(false),
  claimAmount: z.number().positive(),
  reason: z.string().min(5),
  incidentDate: z.string().or(z.date()),
  documents: z.array(z.string()).optional().default([]),
  locationMismatch: z.boolean().optional().default(false),
  incidentWithin24h: z.boolean().optional().default(false),
  geoLocation: z
    .object({
      lat: z.number().optional(),
      lng: z.number().optional(),
      address: z.string().optional(),
      reportedAt: z.string().optional(),
    })
    .optional(),
  hospitalDetails: z
    .object({
      name: z.string().optional(),
      address: z.string().optional(),
      isNetworkHospital: z.boolean().optional().default(false),
    })
    .optional(),
  payoutBankDetails: z
    .object({
      accountNumber: z.string().optional(),
      ifscCode: z.string().optional(),
    })
    .optional(),
});

export const claimDocumentSchema = z.object({
  documentType: z.enum([
    "aadhaar",
    "pan",
    "driving_license",
    "vehicle_rc",
    "medical_report",
    "accident_photo",
    "other",
  ]),
  fileName: z.string().min(1),
  fileSize: z.number().positive(),
  mimeType: z.string().min(1),
  content: z.string().optional().default(""),
});

export const paymentCreateOrderSchema = z.object({
  policyId: z.string().min(1),
  amount: z.number().positive().optional(),
  agentId: z.string().optional(),
  userId: z.string().optional(),
});

export const paymentVerifySchema = z.object({
  policyId: z.string().min(1),
  orderId: z.string().min(1),
  paymentId: z.string().min(1),
  signature: z.string().optional().default(""),
  paymentMethod: z.enum(["upi", "card", "netbanking", "wallet"]).optional().default("upi"),
  agentId: z.string().optional(),
  userId: z.string().optional(),
  autoRenewalFlag: z.boolean().optional().default(false),
  recommendation: z
    .object({
      ai_score: z.number().min(0).max(100).optional(),
      agent_score: z.number().min(0).max(100).optional(),
      final_recommendation_score: z.number().min(0).max(100).optional(),
      recommendation_source: z.enum(["AI", "Agent", "Hybrid"]).optional(),
    })
    .optional()
    .default({}),
});

export const reportExportSchema = z.object({
  reportType: z.enum(["claim_history", "payment_history", "policy_summary", "revenue_analytics"]),
  format: z.enum(["csv", "pdf", "xlsx"]),
  scope: z.enum(["user", "admin"]).optional(),
  filters: z.object({}).passthrough().optional().default({}),
});

export const aiChatSchema = z.object({
  message: z.string().trim().min(1).max(2000),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "bot", "model"]).optional().default("user"),
        message: z.string().optional(),
        content: z.string().optional(),
      }).passthrough(),
    )
    .optional()
    .default([]),
});

export const aiAnalyzeClaimSchema = z.object({
  policyId: z.string().min(1),
  claimAmount: z.number().nonnegative().optional().default(0),
  incidentDate: z.string().optional().default(""),
  description: z.string().optional().default(""),
  documents: z.array(z.union([z.string(), z.object({}).passthrough()])).optional().default([]),
});

export const agentCreateCustomerSchema = z.object({
  fullName: z.string().trim().min(2),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(8),
  mobileNumber: z.string().trim().min(8).max(20),
  city: z.string().trim().optional().default(""),
  state: z.string().trim().optional().default(""),
  user_profile: z.object({}).passthrough().optional().default({}),
});

export const agentUpdateCustomerSchema = z.object({
  fullName: z.string().trim().min(2).optional(),
  mobileNumber: z.string().trim().min(8).max(20).optional(),
  city: z.string().trim().optional(),
  state: z.string().trim().optional(),
  user_profile: z.object({}).passthrough().optional(),
}).refine((obj) => Object.keys(obj || {}).length > 0, {
  message: "At least one field is required",
});

export const agentWorkflowUpdateSchema = z.object({
  status: z.string().trim().optional(),
  priority: z.enum(["Low", "Medium", "High"]).optional(),
  lastContactedAt: z.string().or(z.date()).optional(),
  nextFollowUpAt: z.string().or(z.date()).optional(),
  preferredContactChannel: z.enum(["Phone", "Email", "WhatsApp"]).optional(),
  onboardingStage: z.string().trim().optional(),
  notes: z.string().optional(),
}).refine((obj) => Object.keys(obj || {}).length > 0, {
  message: "At least one field is required",
});

export const agentFollowUpCreateSchema = z.object({
  dueAt: z.string().or(z.date()),
  type: z.string().trim().optional().default("Call"),
  notes: z.string().optional().default(""),
  outcome: z.string().optional().default(""),
  status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional().default("Scheduled"),
});

export const agentFollowUpUpdateSchema = z.object({
  dueAt: z.string().or(z.date()).optional(),
  type: z.string().trim().optional(),
  notes: z.string().optional(),
  outcome: z.string().optional(),
  status: z.enum(["Scheduled", "Completed", "Cancelled"]).optional(),
}).refine((obj) => Object.keys(obj || {}).length > 0, {
  message: "At least one field is required",
});

export const policyUpsertSchema = z.object({
  policyId: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
  company: z.string().trim().min(1),
  price: z.number().nonnegative(),
  coverage: z.number().nonnegative(),
  category: z.enum([
    "car",
    "bike",
    "health",
    "life",
    "travel",
    "home",
    "motor_commercial",
    "liability",
    "business",
    "agriculture",
    "micro_social",
    "specialty",
    "personal_accident",
    "group",
  ]),
  segment: z.enum(["life", "health", "general", "reinsurance"]).optional(),
  subtype: z.string().optional(),
  description: z.string().optional(),
  benefits: z.array(z.string()).optional(),
  coverageDetails: z.array(z.object({ label: z.string(), value: z.string() })).optional(),
  premiumInfo: z
    .object({
      basePremium: z.string().optional(),
      gst: z.string().optional(),
      discounts: z.string().optional(),
      paymentOptions: z.string().optional(),
    })
    .optional(),
  financialTerms: z
    .object({
      deductible: z.number().nonnegative().optional(),
      copayPercentage: z.number().nonnegative().optional(),
    })
    .optional(),
  policy_status: z.enum(["Draft", "Active", "Expired", "Cancelled", "Lapsed", "Renewed"]).optional(),
  issued_date: z.string().or(z.date()).optional(),
  start_date: z.string().or(z.date()).optional(),
  end_date: z.string().or(z.date()).optional(),
  renewal_date: z.string().or(z.date()).optional(),
  lapse_date: z.string().or(z.date()).optional(),
  sum_insured_options: z
    .array(
      z.object({
        amount: z.number().nonnegative().optional(),
        premium: z.number().nonnegative().optional(),
        is_default: z.boolean().optional(),
      }),
    )
    .optional(),
  premium_calculation_formula: z.string().optional(),
  loading_charges: z.number().nonnegative().optional(),
  underwriting_required: z.boolean().optional(),
  underwriting_decision: z.enum(["Pending", "Approved", "Rejected", "Conditional"]).optional(),
  underwriting_notes: z.string().optional(),
  underwriting_assigned_to: z.string().optional(),
  underwriting_completed_at: z.string().or(z.date()).optional(),
  medical_test_required: z.boolean().optional(),
  risk_class_assigned: z.enum(["Standard", "Preferred", "Non-Standard", "Declined"]).optional(),
  availableRiders: z.array(z.object({ name: z.string(), price: z.number().nonnegative() })).optional(),
  policyTermYears: z.number().int().min(1).max(100).optional(),
  gracePeriodDays: z.number().int().min(0).max(365).optional(),
  taxBenefitSection: z.string().optional(),
  eligibility: z.array(z.string()).optional(),
  termsAndConditions: z.array(z.string()).optional(),
  claimProcess: z.array(z.string()).optional(),
  score: z.number().optional(),
  reviewsCount: z.number().int().nonnegative().optional(),
  ratingAverage: z.number().nonnegative().optional(),
  claimSettlementRatio: z.number().nonnegative().optional(),
  waitingPeriodDays: z.number().int().nonnegative().optional(),
  networkCount: z.number().int().nonnegative().optional(),
  popularityScore: z.number().nonnegative().optional(),
  requiredDocumentTypes: z
    .array(
      z.enum([
        "aadhaar",
        "pan",
        "driving_license",
        "vehicle_rc",
        "medical_report",
        "accident_photo",
        "other",
      ]),
    )
    .optional(),
  is_active: z.boolean().optional(),
}).strict();

export const policyUpdateSchema = policyUpsertSchema.partial().refine((obj) => Object.keys(obj || {}).length > 0, {
  message: "At least one field is required",
});
