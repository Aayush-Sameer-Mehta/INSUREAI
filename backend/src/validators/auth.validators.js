import { z } from "zod";

const roleEnum = z.enum(["USER", "AGENT", "ADMIN"]);
const legacyRoleEnum = z.enum(["User", "Agent", "Admin"]);

/* ─── Register ───────────────────────────────────────── */
export const registerSchema = z.object({
    fullName: z
        .string({ required_error: "Full name is required" })
        .trim()
        .min(2, "Full name must be at least 2 characters"),

    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address")
        .transform((v) => v.toLowerCase()),

    password: z
        .string({ required_error: "Password is required" })
        .min(6, "Password must be at least 6 characters"),

    role: roleEnum.optional().default("USER"),

    dateOfBirth: z
        .string()
        .refine((v) => !v || !isNaN(Date.parse(v)), "Invalid date format")
        .optional(),

    gender: z.enum(["Male", "Female", "Other"]).optional(),

    mobileNumber: z
        .string()
        .regex(/^\d{10}$/, "Mobile number must be 10 digits"),

    occupation: z
        .string()
        .trim()
        .optional()
        .default(""),

    annualIncome: z
        .number()
        .nonnegative("Annual income cannot be negative")
        .optional()
        .default(0),

    maritalStatus: z
        .enum(["Single", "Married", "Divorced", "Widowed"])
        .optional()
        .default("Single"),

    numberOfDependents: z
        .number()
        .int()
        .nonnegative()
        .optional()
        .default(0),

    lifestyleHabits: z
        .object({
            smoking: z.boolean().optional().default(false),
            drinking: z.boolean().optional().default(false),
        })
        .optional()
        .default({ smoking: false, drinking: false }),

    existingInsurance: z
        .string()
        .trim()
        .optional()
        .default(""),

    riskAppetite: z
        .enum(["Low", "Medium", "High"])
        .optional()
        .default("Medium"),

    city: z.string().trim().optional().default(""),

    state: z.string().trim().optional().default(""),

    nomineeName: z.string().trim().optional().default(""),

    nomineeRelation: z.string().trim().optional().default(""),

    user_profile: z
        .object({
            age: z.number().int().nonnegative().optional(),
            income: z.number().nonnegative().optional(),
            risk_profile: z.enum(["Low", "Medium", "High"]).optional(),
            assigned_agent_id: z.string().optional(),
        })
        .optional()
        .default({}),

    agent_details: z
        .object({
            license_number: z.string().trim().min(3).optional(),
            commission_percentage: z.number().min(0).max(100).optional(),
            region: z
                .enum([
                    "North",
                    "South",
                    "East",
                    "West",
                    "Central",
                    "Northeast",
                    "Pan-India",
                ])
                .optional(),
        })
        .optional()
        .default({}),

    admin_permissions: z.array(z.string().trim().min(1)).optional().default([]),
    adminInviteCode: z.string().optional(),
});

/* ─── Login ──────────────────────────────────────────── */
export const loginSchema = z
    .object({
        email: z
            .string({ required_error: "Email is required" })
            .email("Invalid email address")
            .transform((v) => v.toLowerCase()),

        password: z
            .string({ required_error: "Password is required" })
            .min(1, "Password is required"),

        login_role: roleEnum.optional(),
        role: z.union([roleEnum, legacyRoleEnum]).optional(),
    })
    .transform((data) => ({
        ...data,
        login_role: String(data.login_role || data.role || "USER").toUpperCase(),
    }));

/* ─── Forgot Password ───────────────────────────────── */
export const forgotPasswordSchema = z.object({
    email: z
        .string({ required_error: "Email is required" })
        .email("Invalid email address")
        .transform((v) => v.toLowerCase()),
});

/* ─── Reset Password ────────────────────────────────── */
export const resetPasswordSchema = z.object({
    token: z
        .string({ required_error: "Reset token is required" })
        .min(1, "Reset token is required"),

    newPassword: z
        .string({ required_error: "New password is required" })
        .min(6, "Password must be at least 6 characters"),
});
