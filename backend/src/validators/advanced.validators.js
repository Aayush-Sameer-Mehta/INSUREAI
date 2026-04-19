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
