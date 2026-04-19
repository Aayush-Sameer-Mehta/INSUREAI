import api from "./api";

function unwrapResponse(data, key) {
 if (key && data?.[key] !== undefined) return data[key];
 return data;
}

const agentWorkspaceService = {
 async getDashboard() {
 const { data } = await api.get("/agent/dashboard");
 return unwrapResponse(data, "dashboard");
 },

 async getCustomers() {
 const { data } = await api.get("/agent/customers");
 return Array.isArray(data) ? data : unwrapResponse(data, "customers") || [];
 },

 async getCustomerDetail(customerId) {
 const { data } = await api.get(`/agent/customers/${customerId}`);
 return data;
 },

 async createCustomer(payload) {
 const { data } = await api.post("/agent/customers", payload);
 return unwrapResponse(data, "customer");
 },

 async updateCustomer(customerId, payload) {
 const { data } = await api.patch(`/agent/customers/${customerId}`, payload);
 return unwrapResponse(data, "customer");
 },

 async updateWorkflow(customerId, payload) {
 const { data } = await api.patch(`/agent/customers/${customerId}/workflow`, payload);
 return data;
 },

 async addFollowUp(customerId, payload) {
 const { data } = await api.post(`/agent/customers/${customerId}/follow-ups`, payload);
 return data;
 },

 async updateFollowUp(customerId, followUpId, payload) {
 const { data } = await api.patch(`/agent/customers/${customerId}/follow-ups/${followUpId}`, payload);
 return data;
 },

 async getClaims() {
 const { data } = await api.get("/claims/my");
 return Array.isArray(data) ? data : unwrapResponse(data, "claims") || [];
 },

 async getCommissions() {
 const { data } = await api.get("/agent/commissions");
 return Array.isArray(data) ? data : unwrapResponse(data, "commissions") || [];
 },
};

export default agentWorkspaceService;
