import api from "./api";

export const createClaim = async (payload) => {
 const { data } = await api.post("/claims", payload);
 return data?.data || data;
};

export const getMyClaims = async () => {
 const { data } = await api.get("/claims/my");
 return data;
};

export const uploadClaimDocument = async (claimId, payload) => {
 const { data } = await api.post(`/claims/${claimId}/documents`, payload);
 return data?.data || data;
};

export const getClaimTimeline = async (claimId) => {
 const { data } = await api.get(`/claims/${claimId}/timeline`);
 return data?.data || data;
};

export const analyzeClaimAI = async (payload) => {
 const { data } = await api.post("/ai/analyze-claim", payload);
 return data;
};

export const uploadClaimDocuments = async (files) => {
 const formData = new FormData();
 files.forEach((file) => formData.append("documents", file));
 const { data } = await api.post("/claims/upload", formData, {
 headers: { "Content-Type": "multipart/form-data" },
 });
 return data?.data || data;
};
