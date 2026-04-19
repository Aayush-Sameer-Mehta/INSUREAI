import { z } from "zod";

/* ─── Shared user profile sub-schema ─────────────────── */
const userProfileSchema = z.object({
    age: z.number().min(1).max(120),
    annualIncome: z.number().nonnegative().optional().default(500000),
    healthConditions: z.array(z.string()).optional().default([]),
    numberOfDependents: z.number().int().nonnegative().optional().default(0),
    lifestyleHabits: z
        .object({
            smoking: z.boolean().optional().default(false),
            drinking: z.boolean().optional().default(false),
        })
        .optional()
        .default({ smoking: false, drinking: false }),
    riskAppetite: z.enum(["Low", "Medium", "High"]).optional().default("Medium"),
    vehicleDetails: z
        .object({
            type: z.enum(["car", "bike"]).optional(),
            make: z.string().optional(),
            model: z.string().optional(),
            year: z.number().optional(),
            value: z.number().optional(),
        })
        .optional(),
});

/* ─── Personalized Recommendations ───────────────────── */
export const personalizedSchema = z.object({
    ...userProfileSchema.shape,
    categories: z
        .array(z.enum(["car", "bike", "health", "life", "travel", "home"]))
        .optional()
        .default([]),
    budget: z.number().positive().optional(),
});

/* ─── Compare Policies ───────────────────────────────── */
export const compareSchema = z.object({
    policyIds: z
        .array(z.string())
        .min(2, "At least 2 policy IDs required")
        .max(5, "Maximum 5 policies for comparison"),
    userProfile: userProfileSchema,
});

/* ─── Dynamic Premium ────────────────────────────────── */
export const premiumSchema = z.object({
    policyId: z.string().min(1, "Policy ID is required"),
    userProfile: userProfileSchema,
});
