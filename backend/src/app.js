import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import path from "path";
import fs from "fs";

import authRoutes from "./domains/auth/routes/auth.routes.js";
import policyRoutes from "./domains/policies/routes/policies.routes.js";
import userRoutes from "./domains/users/routes/users.routes.js";
import aiRoutes from "./domains/ai/routes/ai.routes.js";
import paymentRoutes from "./domains/payments/routes/payments.routes.js";
import recommendationsRoutes from "./domains/recommendations/routes/recommendations.routes.js";
import claimRoutes from "./domains/claims/routes/claims.routes.js";
import adminRoutes from "./domains/admin/routes/admin.routes.js";
import premiumRoutes from "./domains/recommendations/routes/premium.routes.js";
import notificationsRoutes from "./domains/notifications/routes/notifications.routes.js";
import reportsRoutes from "./domains/reports/routes/reports.routes.js";
import errorHandler from "./middleware/errorHandler.js";

const app = express();

app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" },
    frameguard: false,
  })
);

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 150,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: "Too many requests from this IP, please try again later." },
});
app.use("/api", apiLimiter);

app.use(
  cors({
    origin: true,
    credentials: true,
  }),
);
app.use(express.json({ limit: "10mb" }));
app.use("/uploads", express.static(path.join(process.cwd(), "storage", "uploads")));
app.use(morgan("dev"));

app.use("/api/auth", authRoutes);
app.use("/api/policies", policyRoutes);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/recommendations", recommendationsRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/premium", premiumRoutes);
app.use("/api/notifications", notificationsRoutes);
app.use("/api/reports", reportsRoutes);

app.get("/api/health", (_req, res) => res.json({ status: "ok" }));

const possibleDistPaths = [
  path.resolve(process.cwd(), "frontend", "dist"),
  path.resolve(process.cwd(), "..", "frontend", "dist"),
  path.resolve(process.cwd(), "dist"),
];
const distPath = possibleDistPaths.find((p) => fs.existsSync(p)) || possibleDistPaths[0];

if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api")) {
      return next();
    }
    res.sendFile(path.join(distPath, "index.html"), (err) => {
      if (err) next(err);
    });
  });
}

app.use(errorHandler);

export default app;
