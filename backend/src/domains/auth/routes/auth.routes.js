import { Router } from "express";
import crypto from "crypto";
import User from "../../users/models/User.js";
import auth from "../../../middleware/auth.js";
import validate from "../../../middleware/validate.js";
import AppError from "../../../utils/AppError.js";
import { verifyToken } from "../../../utils/token.js";
import { issueAuthTokens } from "../services/auth.service.js";
import { getDashboardRoute, normalizeRole, ROLES } from "../../../utils/roles.js";
import {
    registerSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
} from "../../../validators/auth.validators.js";

const router = Router();

/* ─── Register ───────────────────────────────────────── */
router.post("/register", validate(registerSchema), async (req, res, next) => {
    try {
        const {
            fullName, email, password, role,
            dateOfBirth, gender, mobileNumber,
            occupation, annualIncome, maritalStatus,
            numberOfDependents, lifestyleHabits,
            existingInsurance, riskAppetite,
            city, state, nomineeName, nomineeRelation,
            user_profile, agent_details, admin_permissions,
        } = req.body;

        const existing = await User.findOne({ email });
        if (existing) {
            return next(new AppError("Email already registered", 409));
        }

        if (role === ROLES.ADMIN && req.body.adminInviteCode !== process.env.ADMIN_INVITE_CODE) {
            return next(new AppError("Valid admin invite code is required to register an admin", 403));
        }

        if (role === ROLES.AGENT && !agent_details?.license_number) {
            return next(new AppError("license_number is required for agent registration", 400));
        }

        const user = await User.create({
            fullName, email, password,
            role,
            dateOfBirth, gender, mobileNumber,
            occupation, annualIncome, maritalStatus,
            numberOfDependents, lifestyleHabits,
            existingInsurance, riskAppetite,
            city, state, nomineeName, nomineeRelation,
            user_profile: {
                ...user_profile,
                income: user_profile?.income ?? annualIncome ?? 0,
                risk_profile: user_profile?.risk_profile ?? riskAppetite ?? "Medium",
            },
            agent_details,
            admin_permissions,
        });

        const { accessToken, refreshToken, dashboardRoute } = await issueAuthTokens(user);

        res.status(201).json({
            userId: user._id,
            role: user.role,
            token: accessToken,
            accessToken,
            refreshToken,
            dashboardRoute,
            user,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Login ──────────────────────────────────────────── */
router.post("/login", validate(loginSchema), async (req, res, next) => {
    try {
        const { email, password, login_role = ROLES.USER } = req.body;

        const user = await User.findOne({ email }).select("+password");
        if (!user || !(await user.comparePassword(password))) {
            return next(new AppError("Invalid email or password", 401));
        }

        if (!user.is_active || user.isBlocked) {
            return next(new AppError("Your account is inactive. Please contact support.", 403));
        }

        if (normalizeRole(user.role) !== login_role) {
            return next(new AppError("Invalid role login", 403));
        }

        const tokens = await issueAuthTokens(user);

        user.login_history.push({
            login_time: new Date(),
            device_info: req.headers["user-agent"] || "",
            ip_address: req.ip,
            login_status: "Success",
        });
        await user.save({ validateBeforeSave: false });

        res.json({
            userId: user._id,
            role: user.role,
            token: tokens.accessToken,
            ...tokens,
            user,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Refresh Token ──────────────────────────────────── */
router.post("/refresh-token", async (req, res, next) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            return next(new AppError("Refresh token is required", 400));
        }

        // Verify the token
        let decoded;
        try {
            decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET);
        } catch {
            return next(new AppError("Invalid or expired refresh token", 401));
        }

        // Find user and validate stored token matches
        const user = await User.findById(decoded.user_id || decoded.id);
        if (!user || user.refreshToken !== refreshToken) {
            return next(new AppError("Invalid refresh token", 401));
        }

        // Rotate tokens
        const tokens = await issueAuthTokens(user);

        res.json({
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            dashboardRoute: tokens.dashboardRoute,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Forgot Password ───────────────────────────────── */
router.post("/forgot-password", validate(forgotPasswordSchema), async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return next(new AppError("No user found with that email", 404));
        }

        // Generate a random reset token
        const resetToken = crypto.randomBytes(32).toString("hex");
        user.passwordResetToken = crypto
            .createHash("sha256")
            .update(resetToken)
            .digest("hex");
        user.passwordResetExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save({ validateBeforeSave: false });

        // In production, send this via email. For dev, return in response.
        res.json({
            success: true,
            message: "Password reset token generated (valid for 15 minutes)",
            resetToken,
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Reset Password ────────────────────────────────── */
router.post("/reset-password", validate(resetPasswordSchema), async (req, res, next) => {
    try {
        const { token, newPassword } = req.body;

        // Hash the incoming token and find matching user
        const hashedToken = crypto
            .createHash("sha256")
            .update(token)
            .digest("hex");

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            return next(new AppError("Invalid or expired reset token", 400));
        }

        // Update password and clear reset fields
        user.password = newPassword;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        user.refreshToken = undefined; // invalidate existing sessions
        await user.save();

        res.json({
            success: true,
            message: "Password reset successful. Please log in with your new password.",
        });
    } catch (err) {
        next(err);
    }
});

/* ─── Get current user ───────────────────────────────── */
router.get("/me", auth, (req, res) => {
    res.json({
        user: req.user,
        dashboardRoute: getDashboardRoute(req.user.role),
    });
});

export default router;
