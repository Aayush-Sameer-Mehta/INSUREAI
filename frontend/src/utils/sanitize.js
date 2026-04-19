/**
 * Sanitize a string for safe HTML display.
 * Prevents XSS by escaping HTML entities.
 */
export function escapeHtml(str) {
 if (typeof str !== "string") return "";
 return str
 .replace(/&/g, "&amp;")
 .replace(/</g, "&lt;")
 .replace(/>/g, "&gt;")
 .replace(/"/g, "&quot;")
 .replace(/'/g, "&#039;");
}

/**
 * Strip HTML tags from a string.
 */
export function stripTags(str) {
 if (typeof str !== "string") return "";
 return str.replace(/<[^>]*>/g, "");
}

/**
 * Sanitize user input: trim whitespace and strip tags.
 */
export function sanitizeInput(str) {
 return stripTags(str).trim();
}
