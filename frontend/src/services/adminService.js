import api from "./api";

/* ─── Dashboard Analytics ─────────────────────────────── */
export const getAdminDashboard = () => api.get("/admin/dashboard").then((r) => r.data);
export const getAdminAnalyticsV2 = () => api.get("/admin/analytics/v2").then((r) => r.data);
export const getAdminPremiumAnalytics = (filters) => api.get("/admin/analytics/premium", { params: filters }).then((r) => r.data);
export const exportAdminPremiumAnalytics = (filters) => api.get("/admin/analytics/premium/export", { params: filters, responseType: 'blob' }).then(r => r.data);

/* ─── Users ───────────────────────────────────────────── */
export const getAdminUsers = () => api.get("/admin/users").then((r) => r.data);
export const getAdminUser = (id) => api.get(`/admin/users/${id}`).then((r) => r.data);
export const blockUser = (id, blocked, reason = "") =>
 api.patch(`/admin/users/${id}/block`, { blocked, reason }).then((r) => r.data);
export const updateUserRole = (id, role) =>
 api.patch(`/admin/users/${id}/role`, { role }).then((r) => r.data);

/* ─── Policies ────────────────────────────────────────── */
export const getAdminPolicies = () => api.get("/admin/policies").then((r) => r.data);
export const createPolicy = (data) => api.post("/admin/policies", data).then((r) => r.data);
export const updatePolicy = (id, data) => api.put(`/admin/policies/${id}`, data).then((r) => r.data);
export const deletePolicy = (id) => api.delete(`/admin/policies/${id}`).then((r) => r.data);

/* ─── Claims ──────────────────────────────────────────── */
export const getAdminClaims = (status) =>
 api.get("/admin/claims", { params: status ? { status } : {} }).then((r) => r.data);
export const getAdminClaim = (id) => api.get(`/admin/claims/${id}`).then((r) => r.data);
export const updateClaimStatus = (id, status, adminRemarks = "") =>
 api.patch(`/admin/claims/${id}/status`, { status, adminRemarks }).then((r) => r.data);
export const reviewFraudClaim = (id, payload) =>
 api.patch(`/admin/claims/${id}/review`, payload).then((r) => r.data);

/* ─── Payments ────────────────────────────────────────── */
export const getAdminPayments = () => api.get("/admin/payments").then((r) => r.data);
