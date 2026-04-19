import User from "../domains/users/models/User.js";
import AppError from "../utils/AppError.js";
import { verifyToken } from "../utils/token.js";
import { normalizeRole } from "../utils/roles.js";

/**
 * Authentication middleware.
 * Extracts Bearer token from Authorization header,
 * verifies it, and attaches the user to req.user.
 */
export default async function auth(req, _res, next) {
    try {
        const header = req.headers.authorization;
        if (!header || !header.startsWith("Bearer ")) {
            return next(new AppError("No token provided", 401));
        }

        const token = header.split(" ")[1];
        const decoded = verifyToken(token, process.env.JWT_SECRET);

        const user = await User.findById(decoded.user_id || decoded.id);
        if (!user) {
            return next(new AppError("User belonging to this token no longer exists", 401));
        }
        if (user.isBlocked) {
            return next(new AppError("Your account is blocked. Please contact support.", 403));
        }
        if (!user.is_active) {
            return next(new AppError("Your account is inactive. Please contact support.", 403));
        }

        req.user = user;
        req.user.role = normalizeRole(user.role);
        req.auth = decoded;
        next();
    } catch (err) {
        if (err.name === "TokenExpiredError") {
            return next(new AppError("Token expired. Please log in again.", 401));
        }
        return next(new AppError("Invalid or expired token", 401));
    }
}
