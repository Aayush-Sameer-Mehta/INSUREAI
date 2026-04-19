import api from "./api";

export const askAssistant = async ({ message, history = [] }) => {
 const { data } = await api.post("/ai/chat", { message, history });
 return data;
};

export const getPersonalizedRecommendations = async (profile) => {
 const { data } = await api.post("/recommendations/personalized", profile);
 return data?.data || data;
};

export const calculatePremium = async (payload) => {
 const { data } = await api.post("/premium/calculate", payload);
 return data?.data || data;
};

export const comparePoliciesAdvanced = async (policyIds, userProfile) => {
 const { data } = await api.post("/policies/compare", {
 policyIds,
 userProfile,
 });
 return data?.data || data;
};
