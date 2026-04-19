import jwt from "jsonwebtoken";

/**
 * Generate a short-lived access token (15 minutes).
 */
export function generateAccessToken(payload) {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1hr" });
}

/**
 * Generate a long-lived refresh token (7 days).
 */
export function generateRefreshToken(payload) {
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET, { expiresIn: "1d" });
}

/**
 * Verify a token with the given secret.
 * Returns the decoded payload or throws on invalid/expired tokens.
 */
export function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}
