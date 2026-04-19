import { z } from "zod";

export const textPatterns = {
  personName: /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/,
  cityState: /^[A-Za-z]+(?:[ .'-][A-Za-z]+)*$/,
  ifsc: /^[A-Z]{4}0[A-Z0-9]{6}$/,
  pincode: /^\d{6}$/,
  mobile: /^\d{10}$/,
};

function parseNumberValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    return Number(trimmed);
  }
  if (value === null || value === undefined) return undefined;
  return Number(value);
}

function buildNumberCore(
  label,
  { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false },
  required,
) {
  let schema = z
    .number({
      invalid_type_error: required
        ? `${label} is required`
        : `${label} must be a valid number`,
      required_error: required
        ? `${label} is required`
        : `${label} must be a valid number`,
    })
    .finite(`${label} must be a valid number`);

  if (typeof min === "number") {
    schema = schema.min(min, `${label} must be at least ${min}`);
  }

  if (typeof max === "number") {
    schema = schema.max(max, `${label} must be at most ${max}`);
  }

  if (integer) {
    schema = schema.int(`${label} must be a whole number`);
  }

  return schema;
}

export function requiredText(label, min = 1, max = 160) {
  return z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(min, `${label} is required`)
    .max(max, `${label} cannot exceed ${max} characters`);
}

export function optionalText(max = 600) {
  return z.preprocess(
    (value) => {
      if (typeof value !== "string") return value;
      const trimmed = value.trim();
      return trimmed.length ? trimmed : undefined;
    },
    z.string().max(max, `Cannot exceed ${max} characters`).optional(),
  );
}

export function requiredSelect(label) {
  return z
    .string({ required_error: `${label} is required` })
    .trim()
    .min(1, `${label} is required`);
}

export function requiredNumber(
  label,
  { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {},
) {
  const core = buildNumberCore(label, { min, max, integer }, true);

  return z.preprocess(
    parseNumberValue,
    core,
  );
}

export function optionalNumber(
  label,
  { min = 0, max = Number.MAX_SAFE_INTEGER, integer = false } = {},
) {
  const core = buildNumberCore(label, { min, max, integer }, false).optional();

  return z.preprocess((value) => {
    const parsed = parseNumberValue(value);
    return parsed === undefined ? undefined : parsed;
  }, core);
}

export function splitCommaSeparated(value) {
  if (!value) return [];
  return String(value)
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}
