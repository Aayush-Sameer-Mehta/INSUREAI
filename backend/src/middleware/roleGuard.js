import AppError from "../utils/AppError.js";
import { normalizeRole } from "../utils/roles.js";

/**
 * Role-based authorization middleware.
 * Usage: roleGuard("ADMIN") or roleGuard(["AGENT", "ADMIN"])
 */
export default function roleGuard(...inputRoles) {
    const flatRoles = inputRoles.flat().map((role) => normalizeRole(role));

    return (req, _res, next) => {
        if (!req.user) {
            return next(new AppError("Authentication required", 401));
        }

        if (!flatRoles.includes(normalizeRole(req.user.role))) {
            return next(
                new AppError("You do not have permission to perform this action", 403)
            );
        }

        next();
    };
}
