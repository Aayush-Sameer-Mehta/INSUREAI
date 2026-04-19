export const ROLES = {
  USER: "USER",
  AGENT: "AGENT",
  ADMIN: "ADMIN",
};

export const ROLE_VALUES = Object.values(ROLES);

export function normalizeRole(role) {
  return String(role || ROLES.USER).trim().toUpperCase();
}

export function isValidRole(role) {
  return ROLE_VALUES.includes(normalizeRole(role));
}

export function getDashboardRoute(role) {
  const normalizedRole = normalizeRole(role);

  if (normalizedRole === ROLES.AGENT) return "/agent/dashboard";
  if (normalizedRole === ROLES.ADMIN) return "/admin/dashboard";
  return "/user/dashboard";
}
