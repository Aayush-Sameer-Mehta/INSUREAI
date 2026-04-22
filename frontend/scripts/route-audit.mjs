import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "@playwright/test";

const baseUrl = process.env.BASE_URL || "http://localhost:5173";
const outputPath =
  process.env.ROUTE_AUDIT_OUTPUT ||
  path.resolve(process.cwd(), "route-audit-report.json");

const routes = [
  "/",
  "/policies",
  "/policies/invalid-id",
  "/compare-policies",
  "/premium-calculator",
  "/recommendations",
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/dashboard",
  "/user/dashboard",
  "/my-policies",
  "/renewals",
  "/profile",
  "/onboarding",
  "/preferences",
  "/claims",
  "/payment/invalid-id",
  "/admin",
  "/admin/dashboard",
  "/admin/users",
  "/admin/policies",
  "/admin/policies/new",
  "/admin/claims",
  "/admin/payments",
  "/admin/analytics",
  "/admin/reports",
  "/admin/settings",
  "/contact",
  "/this-route-should-404",
];

function normalizeRoute(route) {
  if (!route || route === "/") return "/";
  return route.endsWith("/") ? route.slice(0, -1) : route;
}

function normalizeUrlForCompare(urlString) {
  try {
    const url = new URL(urlString);
    const route = normalizeRoute(url.pathname);
    return `${url.origin}${route}`;
  } catch {
    return urlString;
  }
}

function trimText(value, max = 220) {
  const text = String(value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  return `${text.slice(0, max - 3)}...`;
}

function dedupeBy(items, keyFn) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = keyFn(item);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

async function auditRoute(context, route) {
  const page = await context.newPage();
  const consoleIssues = [];
  const pageErrors = [];
  const failedRequests = [];

  page.on("console", (msg) => {
    const type = msg.type();
    if (type !== "warning" && type !== "error") return;
    consoleIssues.push({
      type,
      text: trimText(msg.text()),
      location: msg.location(),
    });
  });

  page.on("pageerror", (error) => {
    pageErrors.push(trimText(error?.message || String(error)));
  });

  page.on("requestfailed", (request) => {
    failedRequests.push({
      url: request.url(),
      method: request.method(),
      failure: request.failure()?.errorText || "Unknown request failure",
    });
  });

  const target = `${baseUrl}${route}`;
  let navigationError = null;
  let status = null;
  const startedAt = Date.now();

  try {
    const response = await page.goto(target, {
      waitUntil: "domcontentloaded",
      timeout: 30000,
    });
    status = response?.status() ?? null;
    await page.waitForTimeout(2500);
  } catch (error) {
    navigationError = trimText(error?.message || String(error), 300);
  }

  const finalUrl = page.url();
  const title = await page.title().catch(() => "");
  const durationMs = Date.now() - startedAt;

  await page.close();

  const cleanedConsoleIssues = dedupeBy(
    consoleIssues.map((issue) => ({
      type: issue.type,
      text: issue.text,
      location: issue.location?.url
        ? `${issue.location.url}:${issue.location.lineNumber ?? 0}:${issue.location.columnNumber ?? 0}`
        : "unknown",
    })),
    (issue) => `${issue.type}|${issue.text}|${issue.location}`,
  );

  const cleanedPageErrors = dedupeBy(pageErrors, (item) => item);
  const cleanedFailedRequests = dedupeBy(
    failedRequests.map((failure) => ({
      method: failure.method,
      url: trimText(failure.url, 180),
      failure: trimText(failure.failure),
    })),
    (failure) => `${failure.method}|${failure.url}|${failure.failure}`,
  );

  const requestedComparable = normalizeUrlForCompare(target);
  const finalComparable = normalizeUrlForCompare(finalUrl);

  return {
    route,
    target,
    finalUrl,
    title: trimText(title, 120),
    status,
    redirected: requestedComparable !== finalComparable,
    durationMs,
    navigationError,
    counts: {
      consoleIssues: cleanedConsoleIssues.length,
      pageErrors: cleanedPageErrors.length,
      requestFailures: cleanedFailedRequests.length,
    },
    consoleIssues: cleanedConsoleIssues,
    pageErrors: cleanedPageErrors,
    requestFailures: cleanedFailedRequests,
  };
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();

  const results = [];
  for (const route of routes) {
    // eslint-disable-next-line no-await-in-loop
    const result = await auditRoute(context, route);
    results.push(result);
    const hasIssues =
      result.navigationError ||
      result.counts.consoleIssues ||
      result.counts.pageErrors ||
      result.counts.requestFailures;
    console.log(
      `${hasIssues ? "ISSUE" : "OK"} | ${route} -> ${result.finalUrl} | ` +
        `console=${result.counts.consoleIssues} page=${result.counts.pageErrors} ` +
        `reqFail=${result.counts.requestFailures}`,
    );
  }

  await context.close();
  await browser.close();

  const summary = {
    generatedAt: new Date().toISOString(),
    baseUrl,
    totalRoutes: results.length,
    routesWithAnyIssue: results.filter(
      (routeResult) =>
        routeResult.navigationError ||
        routeResult.counts.consoleIssues > 0 ||
        routeResult.counts.pageErrors > 0 ||
        routeResult.counts.requestFailures > 0,
    ).length,
  };

  const report = { summary, results };
  await fs.writeFile(outputPath, JSON.stringify(report, null, 2), "utf8");
  console.log(`\nRoute audit report written to: ${outputPath}`);
  console.log(
    `Routes with issues: ${summary.routesWithAnyIssue}/${summary.totalRoutes}`,
  );
}

main().catch((error) => {
  console.error("Route audit failed:", error);
  process.exit(1);
});
