import api from "./api";


const normalizePolicy = (policy) => ({
 ...policy,
 id: policy.id || policy.policyId || policy._id,
 company: policy.company || policy.companyName || "",
 price: Number(policy.price || 0),
 coverage: Number(policy.coverage || 0)
});



const applyFilters = (policies, params = {}) => {
 const search = String(params.search || "").toLowerCase().trim();
 const company = String(params.company || "").toLowerCase().trim();
 const category = String(params.category || "").toLowerCase().trim();
 const priceMax = Number(params.priceMax || 0);
 const coverageMin = Number(params.coverageMin || 0);

 return policies.filter((policy) => {
 const matchesSearch =
 !search ||
 policy.name.toLowerCase().includes(search) ||
 policy.company.toLowerCase().includes(search) ||
 policy.description.toLowerCase().includes(search);
 const matchesCompany = !company || policy.company.toLowerCase() === company;
 const matchesCategory = !category || policy.category.toLowerCase() === category;
 const matchesPrice = !priceMax || policy.price <= priceMax;
 const matchesCoverage = !coverageMin || policy.coverage >= coverageMin;

 return (
 matchesSearch &&
 matchesCompany &&
 matchesCategory &&
 matchesPrice &&
 matchesCoverage
 );
 });
};

export const fetchPolicies = async (params = {}) => {
 try {
 const response = await api.get("/policies", { params });
 const data = response.data;
 const items = Array.isArray(data) ? data : (data.policies || []);
 const backend = items.map(normalizePolicy);
 return applyFilters(backend, params);
 } catch {
 return [];
 }
};

export const fetchPoliciesPaginated = async (params = {}) => {
 try {
 const response = await api.get("/policies", { params });
 const data = response.data;
 const meta = response.meta || {};
 const items = Array.isArray(data) ? data : (data.policies || []);
 return {
 policies: items.map(normalizePolicy),
 totalPages: meta.totalPages || data.totalPages || 1,
 currentPage: meta.page || data.currentPage || 1,
 totalCount: meta.totalCount || data.totalCount || items.length
 };
 } catch {
 return { policies: [], totalPages: 1, currentPage: 1, totalCount: 0 };
 }
};

export const fetchPolicyById = async (id) => {
 try {
 const { data } = await api.get(`/policies/${id}`);
 return normalizePolicy(data);
 } catch {
 return null;
 }
};

export const fetchPolicyReviews = async (id) => {
 try {
 const { data } = await api.get(`/policies/${id}/reviews`);
 return data;
 } catch {
 return [];
 }
};

export const submitPolicyReview = async (id, payload) => {
 const { data } = await api.post(`/policies/${id}/reviews`, payload);
 return data;
};

export const purchasePolicy = async (payload) => {
 const { data } = await api.post("/users/purchase", payload);
 return data;
};
