import axios from "axios";
import env from "../config/env";
import { clearTokens, getAccessToken, getRefreshToken, setTokens } from "./authStorage";

const api = axios.create({
 baseURL: env.API_URL,
 timeout: 12000,
});

/* ─── Request interceptor: attach access token ──────── */
api.interceptors.request.use((config) => {
 const token = getAccessToken();
 if (token) {
 config.headers.Authorization = `Bearer ${token}`;
 }
 return config;
});

/* ─── Response interceptor: auto-refresh on 401 ─────── */
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
 failedQueue.forEach((prom) => {
 if (error) {
 prom.reject(error);
 } else {
 prom.resolve(token);
 }
 });
 failedQueue = [];
};

api.interceptors.response.use(
 (response) => {
 const payload = response?.data;
 if (
 payload &&
 typeof payload === "object" &&
 !Array.isArray(payload) &&
 Object.prototype.hasOwnProperty.call(payload, "success") &&
 Object.prototype.hasOwnProperty.call(payload, "data")
 ) {
 response.data = payload.data;
 response.meta = payload.meta || {};
 response.message = payload.message || "";
 }
 return response;
 },
 async (error) => {
 const originalRequest = error.config;

 // Only attempt refresh for 401 errors that haven't been retried yet
 if (error.response?.status === 401 && !originalRequest._retry) {
 // Don't retry refresh-token or login requests
 if (
 originalRequest.url?.includes("/auth/refresh-token") ||
 originalRequest.url?.includes("/auth/login")
 ) {
 return Promise.reject(error);
 }

 if (isRefreshing) {
 // Queue the request while refresh is in progress
 return new Promise((resolve, reject) => {
 failedQueue.push({ resolve, reject });
 })
 .then((token) => {
 originalRequest.headers.Authorization = `Bearer ${token}`;
 return api(originalRequest);
 })
 .catch((err) => Promise.reject(err));
 }

 originalRequest._retry = true;
 isRefreshing = true;

 const storedRefreshToken = getRefreshToken();

 if (!storedRefreshToken) {
 isRefreshing = false;
 // No refresh token — force logout
 clearTokens();
 window.dispatchEvent(new Event("insureai:logout"));
 return Promise.reject(error);
 }

 try {
 const refreshResponse = await axios.post(
 `${api.defaults.baseURL}/auth/refresh-token`,
 { refreshToken: storedRefreshToken }
 );
 const payload =
 refreshResponse?.data &&
 typeof refreshResponse.data === "object" &&
 Object.prototype.hasOwnProperty.call(refreshResponse.data, "data")
 ? refreshResponse.data.data
 : refreshResponse.data;

 setTokens(payload);

 processQueue(null, payload.accessToken);

 originalRequest.headers.Authorization = `Bearer ${payload.accessToken}`;
 return api(originalRequest);
 } catch (refreshError) {
 processQueue(refreshError, null);
 clearTokens();
 window.dispatchEvent(new Event("insureai:logout"));
 return Promise.reject(refreshError);
 } finally {
 isRefreshing = false;
 }
 }

 return Promise.reject(error);
 }
);

export default api;
