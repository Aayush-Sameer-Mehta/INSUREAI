import api from "./api";

/**
 * Authenticate with Google OAuth token
 * @param {string} token - Google credential token from @react-oauth/google
 * @returns {Promise<Object>} User data and tokens
 */
export const googleLogin = async (token) => {
  const { data } = await api.post("/auth/google", { token });
  return data?.data || data;
};
