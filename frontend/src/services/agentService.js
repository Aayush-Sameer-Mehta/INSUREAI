import axios from "axios";

const API_BASE_URL =
 import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

const apiClient = axios.create({
 baseURL: API_BASE_URL,
 timeout: 10000,
});

// Add token to every request
apiClient.interceptors.request.use((config) => {
 const token = localStorage.getItem("agentToken");
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

// Handle response errors
apiClient.interceptors.response.use(
 (response) => response,
 (error) => {
 if (error.response?.status === 401) {
 // Unauthorized - clear token and redirect to login
 localStorage.removeItem("agentToken");
 window.location.href = "/agent/login";
 }
 return Promise.reject(error);
 },
);

class AgentService {
 // Authentication
 static async login(email, password) {
 const response = await apiClient.post("/agents/login", { email, password });
 if (response.data.token) {
 localStorage.setItem("agentToken", response.data.token);
 }
 return response.data;
 }

 static async register(userData) {
 const response = await apiClient.post("/agents/register", userData);
 return response.data;
 }

 static async logout() {
 localStorage.removeItem("agentToken");
 return apiClient.post("/agents/logout");
 }

 // Dashboard
 static async getDashboard() {
 return apiClient.get("/agents/dashboard");
 }

 static async getPerformanceMetrics(month, year) {
 return apiClient.get(`/agents/performance/${year}/${month}`);
 }

 // Profile
 static async getProfile() {
 return apiClient.get("/agents/me");
 }

 static async updateProfile(data) {
 return apiClient.put("/agents/profile", data);
 }

 static async updateBankDetails(data) {
 return apiClient.put("/agents/bank-details", data);
 }

 // Clients
 static async getClients(filters) {
 return apiClient.get("/agents/clients", { params: filters });
 }

 static async getClientById(clientId) {
 return apiClient.get(`/agents/clients/${clientId}`);
 }

 static async addClient(clientData) {
 return apiClient.post("/agents/clients", clientData);
 }

 static async updateClient(clientId, clientData) {
 return apiClient.put(`/agents/clients/${clientId}`, clientData);
 }

 static async deleteClient(clientId) {
 return apiClient.delete(`/agents/clients/${clientId}`);
 }

 static async getClientPolicies(clientId) {
 return apiClient.get(`/agents/clients/${clientId}/policies`);
 }

 static async getClientClaims(clientId) {
 return apiClient.get(`/agents/clients/${clientId}/claims`);
 }

 // Policies
 static async getAvailablePolicies(filters) {
 return apiClient.get("/agents/policies/available", { params: filters });
 }

 static async getPolicyDetails(policyId) {
 return apiClient.get(`/agents/policies/details/${policyId}`);
 }

 static async getSoldPolicies(filters) {
 return apiClient.get("/agents/policies/sold", { params: filters });
 }

 static async recommendPolicy(clientId, data) {
 return apiClient.post("/agents/policies/recommend", {
 clientId,
 ...data,
 });
 }

 static async assignPolicyToClient(policyId, clientId) {
 return apiClient.post("/agents/policies/assign", {
 policyId,
 clientId,
 });
 }

 // Leads
 static async getLeads(filters) {
 return apiClient.get("/agents/leads", { params: filters });
 }

 static async getLeadById(leadId) {
 return apiClient.get(`/agents/leads/${leadId}`);
 }

 static async addLead(leadData) {
 return apiClient.post("/agents/leads", leadData);
 }

 static async updateLead(leadId, leadData) {
 return apiClient.put(`/agents/leads/${leadId}`, leadData);
 }

 static async deleteLead(leadId) {
 return apiClient.delete(`/agents/leads/${leadId}`);
 }

 static async convertLead(leadId, policyId) {
 return apiClient.put(`/agents/leads/${leadId}/status`, {
 status: "CONVERTED",
 policyId,
 });
 }

 static async scheduleFollowUp(leadId, followUpData) {
 return apiClient.post(`/agents/leads/${leadId}/follow-up`, followUpData);
 }

 static async getLeadFollowUps(leadId) {
 return apiClient.get(`/agents/leads/${leadId}/follow-ups`);
 }

 static async bulkUploadLeads(file) {
 const formData = new FormData();
 formData.append("file", file);
 return apiClient.post("/agents/leads/bulk-upload", formData);
 }

 // Claims
 static async getClaims(filters) {
 return apiClient.get("/agents/claims", { params: filters });
 }

 static async getClaimById(claimId) {
 return apiClient.get(`/agents/claims/${claimId}`);
 }

 static async initiateClaim(claimData) {
 return apiClient.post("/agents/claims", claimData);
 }

 static async updateClaim(claimId, claimData) {
 return apiClient.put(`/agents/claims/${claimId}`, claimData);
 }

 static async getClaimStatus(claimId) {
 return apiClient.get(`/agents/claims/${claimId}/status`);
 }

 static async uploadClaimDocument(claimId, file) {
 const formData = new FormData();
 formData.append("document", file);
 return apiClient.post(`/agents/claims/${claimId}/documents`, formData);
 }

 // Earnings
 static async getEarningsDashboard(month, year) {
 return apiClient.get("/agents/earnings", {
 params: { month, year },
 });
 }

 static async getCommissionHistory(filters) {
 return apiClient.get("/agents/earnings/history", { params: filters });
 }

 static async getEarningsBreakdown(month, year) {
 return apiClient.get("/agents/earnings/breakdown", {
 params: { month, year },
 });
 }

 static async getPayouts(filters) {
 return apiClient.get("/agents/payouts", { params: filters });
 }

 static async requestPayout(bankDetailsId) {
 return apiClient.post("/agents/payouts/request", { bankDetailsId });
 }

 // Documents
 static async getDocuments() {
 return apiClient.get("/agents/documents");
 }

 static async uploadDocument(file, documentType) {
 const formData = new FormData();
 formData.append("document", file);
 formData.append("documentType", documentType);
 return apiClient.post("/agents/documents/upload", formData);
 }

 static async deleteDocument(documentId) {
 return apiClient.delete(`/agents/documents/${documentId}`);
 }

 static async downloadDocument(documentId) {
 return apiClient.get(`/agents/documents/${documentId}/download`, {
 responseType: "blob",
 });
 }

 // Notifications
 static async getNotifications() {
 return apiClient.get("/agents/notifications");
 }

 static async markNotificationAsRead(notificationId) {
 return apiClient.put(`/agents/notifications/${notificationId}/read`);
 }

 static async markAllNotificationsAsRead() {
 return apiClient.put("/agents/notifications/mark-all-read");
 }

 static async updateNotificationPreferences(preferences) {
 return apiClient.post("/agents/notifications/preferences", preferences);
 }

 // Messages
 static async getConversations() {
 return apiClient.get("/agents/messages");
 }

 static async getMessages(conversationId) {
 return apiClient.get(`/agents/messages/${conversationId}`);
 }

 static async sendMessage(conversationId, message) {
 return apiClient.post("/agents/messages", {
 conversationId,
 message,
 });
 }

 // Settings
 static async changePassword(oldPassword, newPassword) {
 return apiClient.post("/agents/change-password", {
 oldPassword,
 newPassword,
 });
 }

 static async updateSettings(settings) {
 return apiClient.put("/agents/settings", settings);
 }

 static async getLoginHistory() {
 return apiClient.get("/agents/login-history");
 }
}

export default AgentService;
