import { z } from "zod";
import { optionalText, requiredNumber, requiredSelect, textPatterns } from "./patterns";

export const MAX_CLAIM_FILE_SIZE_BYTES = 5 * 1024 * 1024;
export const MAX_CLAIM_DOCUMENTS = 5;
export const SUPPORTED_CLAIM_FILE_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const isBrowserFile = (value) =>
  typeof File !== "undefined" && value instanceof File;

const claimDocumentSchema = z
  .custom((value) => isBrowserFile(value), {
    message: "Unsupported document",
  })
  .refine(
    (file) => file.size <= MAX_CLAIM_FILE_SIZE_BYTES,
    "Each file must be 5MB or smaller",
  )
  .refine(
    (file) => SUPPORTED_CLAIM_FILE_TYPES.includes(file.type),
    "Only PDF, JPG, JPEG, PNG, and WEBP files are allowed",
  );

export const claimDocumentsSchema = z
  .array(claimDocumentSchema)
  .max(MAX_CLAIM_DOCUMENTS, `You can upload up to ${MAX_CLAIM_DOCUMENTS} files`);

export const claimSchema = z.object({
  selectedPolicy: requiredSelect("Policy"),
  claimAmount: requiredNumber("Claim amount", {
    min: 1,
    max: 100000000,
  }),
  claimCategory: z.enum(["reimbursement", "cashless"], {
    required_error: "Claim category is required",
  }),
  incidentDate: z
    .string()
    .min(1, "Incident date is required")
    .refine((value) => !Number.isNaN(new Date(value).getTime()), "Invalid date")
    .refine(
      (value) => new Date(value) <= new Date(),
      "Incident date cannot be in the future",
    ),
  description: z
    .string()
    .trim()
    .min(10, "Description must be at least 10 characters long")
    .max(1000, "Description cannot exceed 1000 characters"),
  hospitalName: optionalText(120),
  hospitalAddress: optionalText(180),
  isNetworkHospital: z.boolean().default(false),
  isEmergency: z.boolean().default(false),
  bankAccountNumber: z
    .string()
    .trim()
    .regex(/^\d{8,18}$/, "Account number must be 8 to 18 digits"),
  bankIfscCode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(textPatterns.ifsc, "Invalid IFSC code format (e.g., HDFC0001234)"),
  documents: claimDocumentsSchema.optional(),
});

