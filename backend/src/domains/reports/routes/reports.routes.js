import fs from "fs/promises";
import path from "path";
import { Router } from "express";
import auth from "../../../middleware/auth.js";
import roleGuard from "../../../middleware/roleGuard.js";
import validate from "../../../middleware/validate.js";
import { reportExportSchema } from "../../../validators/advanced.validators.js";
import ReportJob from "../models/ReportJob.js";
import { generateReport } from "../services/report.service.js";
import { ok, fail } from "../../shared/services/response.js";
import { ERROR_CODES } from "../../shared/services/error-codes.js";

const router = Router();
const REPORT_DIR = path.join(process.cwd(), "reports");

router.use(auth);

router.post("/export", validate(reportExportSchema), async (req, res, next) => {
  try {
    const body = req.body;
    const scope = body.scope || (req.user.role === "ADMIN" ? "admin" : "user");
    if (scope === "admin" && req.user.role !== "ADMIN") {
      return fail(res, "Admin scope not allowed", ERROR_CODES.FORBIDDEN, 403);
    }

    const job = await generateReport({
      requestedBy: req.user._id,
      scope,
      reportType: body.reportType,
      format: body.format,
      filters: body.filters,
    });

    return ok(res, job, {}, 201);
  } catch (err) {
    return next(err);
  }
});

router.get("/:id/download", async (req, res, next) => {
  try {
    const job = await ReportJob.findById(req.params.id);
    if (!job) {
      return fail(res, "Report not found", ERROR_CODES.NOT_FOUND, 404);
    }
    if (job.scope === "admin" && req.user.role !== "ADMIN") {
      return fail(res, "Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }
    if (job.scope === "user" && String(job.requestedBy) !== String(req.user._id) && req.user.role !== "ADMIN") {
      return fail(res, "Forbidden", ERROR_CODES.FORBIDDEN, 403);
    }
    if (job.status !== "Completed") {
      return fail(res, "Report is not ready", ERROR_CODES.CONFLICT, 409);
    }

    const resolvedPath = path.resolve(String(job.filePath || ""));
    const resolvedReportDir = path.resolve(REPORT_DIR);
    if (!resolvedPath || !resolvedPath.startsWith(resolvedReportDir + path.sep)) {
      return fail(res, "Invalid report path", ERROR_CODES.VALIDATION_FAILED, 400);
    }

    const content = await fs.readFile(resolvedPath);
    const filename = resolvedPath.split(/[\\/]/).pop();
    const ext = String(path.extname(filename || "")).toLowerCase();
    if (ext === ".csv") res.setHeader("Content-Type", "text/csv; charset=utf-8");
    else if (ext === ".pdf") res.setHeader("Content-Type", "application/pdf");
    else if (ext === ".xlsx") {
      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
    }
    res.setHeader("Content-Disposition", `attachment; filename=\"${filename}\"`);
    return res.send(content);
  } catch (err) {
    return next(err);
  }
});

router.post("/admin/trigger-reminders", roleGuard("ADMIN"), async (req, res, next) => {
  try {
    // Safe no-op endpoint placeholder to integrate scheduler triggers from admin tools.
    return ok(res, { triggered: true });
  } catch (err) {
    return next(err);
  }
});

export default router;
