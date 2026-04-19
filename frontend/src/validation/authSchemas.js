import { z } from "zod";
import {
  optionalText,
  requiredNumber,
  requiredSelect,
  requiredText,
  textPatterns,
} from "./patterns";

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  login_role: z.enum(["USER", "AGENT", "ADMIN"], {
    required_error: "Please choose a login role",
  }),
});

const dobSchema = z
  .string()
  .min(1, "Date of birth is required")
  .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")
  .refine((value) => {
    const dob = new Date(value);
    const today = new Date();
    return dob <= today;
  }, "Date of birth cannot be in the future")
  .refine((value) => {
    const dob = new Date(value);
    const today = new Date();
    const age = today.getFullYear() - dob.getFullYear();
    const hadBirthday =
      today.getMonth() > dob.getMonth() ||
      (today.getMonth() === dob.getMonth() &&
        today.getDate() >= dob.getDate());
    return age > 18 || (age === 18 && hadBirthday);
  }, "You must be at least 18 years old");

export const registerSchema = z.object({
  fullName: requiredText("Full name", 3, 120).refine(
    (value) => textPatterns.personName.test(value),
    "Enter a valid full name",
  ),
  email: z.string().trim().email("Valid email required"),
  mobileNumber: z
    .string()
    .trim()
    .regex(textPatterns.mobile, "10-digit mobile required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=[\]{};:'",.<>/?\\|`~])/,
      "Use 1 uppercase letter, 1 number, and 1 special character",
    ),
  dateOfBirth: dobSchema,
  gender: requiredSelect("Gender"),
  maritalStatus: requiredSelect("Marital status"),
  city: requiredText("City", 2, 60).refine(
    (value) => textPatterns.cityState.test(value),
    "Enter a valid city name",
  ),
  state: optionalText(60),
  pincode: z
    .union([z.literal(""), z.string().trim().regex(textPatterns.pincode)])
    .optional()
    .transform((value) => value || undefined),
  employmentType: optionalText(60),
  occupation: requiredText("Occupation", 2, 80),
  annualIncome: requiredNumber("Annual income", {
    min: 0,
    max: 1000000000,
    integer: true,
  }),
});

