import api from "./api";

export const loginUser = async (payload) => {
 const { data } = await api.post("/auth/login", payload);
 return data?.data || data;
};

export const registerUser = async (payload) => {
 const { data } = await api.post("/auth/register", payload);
 return data?.data || data;
};

export const getMe = async () => {
 const { data } = await api.get("/auth/me");
 return data?.data || data;
};

export const refreshToken = async (token) => {
 const { data } = await api.post("/auth/refresh-token", { refreshToken: token });
 return data?.data || data;
};

export const forgotPassword = async (email) => {
 const { data } = await api.post("/auth/forgot-password", { email });
 return data?.data || data;
};

export const resetPassword = async (token, newPassword) => {
 const { data } = await api.post("/auth/reset-password", { token, newPassword });
 return data?.data || data;
};
