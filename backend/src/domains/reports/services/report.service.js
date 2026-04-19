import fs from "fs/promises";
import path from "path";
import ReportJob from "../models/ReportJob.js";
import Claim from "../../claims/models/Claim.js";
import User from "../../users/models/User.js";

const REPORT_DIR = path.join(process.cwd(), "reports");

async function ensureReportDir() {
  await fs.mkdir(REPORT_DIR, { recursive: true });
}

function toCsv(rows) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(
      headers
        .map((h) => `"${String(row[h] ?? "").replace(/"/g, '""')}"`)
        .join(",")
    );
  }
  return lines.join("\n");
}

async function gatherRows(reportType, userId, scope) {
  if (reportType === "claim_history") {
    const filter = scope === "admin" ? {} : { user: userId };
    const claims = await Claim.find(filter).populate("policy", "name category").lean();
    return claims.map((c) => ({
      claimId: c.claimId,
      status: c.status,
      claimAmount: c.claimAmount,
      category: c.policy?.category || "",
      policyName: c.policy?.name || "",
      fraudRiskScore: c.fraudRiskScore || 0,
      createdAt: c.createdAt,
    }));
  }

  const users = await User.find(scope === "admin" ? {} : { _id: userId })
    .populate("purchasedPolicies.policy", "name category")
    .lean();

  const rows = [];
  for (const u of users) {
    for (const p of u.purchasedPolicies || []) {
      rows.push({
        userEmail: u.email,
        policyName: p.policy?.name || "",
        category: p.policy?.category || "",
        amount: p.amount,
        purchasedAt: p.purchasedAt,
      });
    }
  }
  return rows;
}

export async function generateReport({ requestedBy, scope, reportType, format, filters = {} }) {
  await ensureReportDir();
  const job = await ReportJob.create({
    requestedBy,
    scope,
    reportType,
    format,
    filters,
    status: "Pending",
  });

  try {
    const rows = await gatherRows(reportType, requestedBy, scope);
    const baseName = `report-${job._id}.${format}`;
    const filePath = path.join(REPORT_DIR, baseName);

    if (format === "csv") {
      await fs.writeFile(filePath, toCsv(rows), "utf8");
    } else {
      // Minimal placeholder output for pdf/xlsx with deterministic JSON payload.
      await fs.writeFile(filePath, JSON.stringify({ rows, format }, null, 2), "utf8");
    }

    job.filePath = filePath;
    job.status = "Completed";
    job.completedAt = new Date();
    await job.save();
  } catch (err) {
    job.status = "Failed";
    job.errorMessage = err.message;
    await job.save();
  }

  return job;
}

