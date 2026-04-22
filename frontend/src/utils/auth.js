export function normalizeRole(role) {
 return String(role || "USER").toUpperCase();
}

export function getDashboardRouteForRole(role) {
 const normalizedRole = normalizeRole(role);

 if (normalizedRole === "ADMIN") return "/admin/dashboard";
 return "/user/dashboard";
}

export function extractAuthUser(payload) {
 if (!payload) return null;
 return payload.user || payload;
}
