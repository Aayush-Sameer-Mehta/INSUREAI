import AppError from "../utils/AppError.js";

/**
 * Centralized error-handling middleware.
 * Catches operational errors, Zod errors, Mongoose errors, and JWT errors.
 */
export default function errorHandler(err, _req, res, _next) {
    // Default values
    err.statusCode = err.statusCode || 500;
    err.status = err.status || "error";

    /* ─── Mongoose duplicate key (e.g. unique email) ──── */
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue || {})[0] || "field";
        err = new AppError(`Duplicate value for '${field}'. Please use another.`, 409);
    }

    /* ─── Mongoose CastError (bad ObjectId) ──────────── */
    if (err.name === "CastError") {
        err = new AppError(`Invalid ${err.path}: ${err.value}`, 400);
    }

    /* ─── Mongoose ValidationError ───────────────────── */
    if (err.name === "ValidationError") {
        const messages = Object.values(err.errors).map((e) => e.message);
        err = new AppError(messages.join(". "), 400);
    }

    /* ─── JWT errors ─────────────────────────────────── */
    if (err.name === "JsonWebTokenError") {
        err = new AppError("Invalid token. Please log in again.", 401);
    }
    if (err.name === "TokenExpiredError") {
        err = new AppError("Token expired. Please log in again.", 401);
    }

    /* ─── Database offline / network fallback ───────── */
    if (
        err.name === "MongooseError" ||
        err.name === "MongoNetworkError" ||
        err.name === "MongoServerSelectionError" ||
        (err.message && err.message.includes("buffering timed out"))
    ) {
        console.warn("[AI Studio] Database offline — returning fallback response");
        if (_req.method === "GET") {
            const endsWithS = _req.path.endsWith("s") || _req.path.endsWith("s/");
            return res.json({ success: true, data: endsWithS ? [] : {}, policies: endsWithS ? [] : [] });
        }
        return res.status(503).json({ success: false, message: "Service temporarily unavailable (database offline)" });
    }

    /* ─── Send response ──────────────────────────────── */
    const response = {
        success: false,
        message: err.message || "Internal server error",
    };

    // Only include stack in development
    if (process.env.NODE_ENV !== "production") {
        response.stack = err.stack;
    }

    res.status(err.statusCode).json(response);
}
