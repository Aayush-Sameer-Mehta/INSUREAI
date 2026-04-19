import { createContext, useContext, useEffect, useMemo, useState, useCallback } from "react";
import { getMe, loginUser, registerUser } from "../services/authService";
import { clearTokens, getAccessToken, setTokens } from "../services/authStorage";
import { extractAuthUser, getDashboardRouteForRole } from "../utils/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
 const [user, setUser] = useState(null);
 const [token, setToken] = useState(getAccessToken());
 const [authLoading, setAuthLoading] = useState(true);
 const [dashboardRoute, setDashboardRoute] = useState("/user/dashboard");

 /* ─── Load user profile on mount if token exists ──── */
 useEffect(() => {
 const init = async () => {
 if (!token) {
 setAuthLoading(false);
 return;
 }

 try {
 const profile = await getMe();
 const resolvedUser = extractAuthUser(profile);
 setUser(resolvedUser);
 setDashboardRoute(profile?.dashboardRoute || getDashboardRouteForRole(resolvedUser?.role));
 } catch {
 clearTokens();
 setToken("");
 setUser(null);
 setDashboardRoute("/user/dashboard");
 } finally {
 setAuthLoading(false);
 }
 };

 init();
 }, [token]);

 /* ─── Listen for forced logout from API interceptor ── */
 useEffect(() => {
 const handleLogout = () => {
 setToken("");
 setUser(null);
 setDashboardRoute("/user/dashboard");
 };
 window.addEventListener("insureai:logout", handleLogout);
 return () => window.removeEventListener("insureai:logout", handleLogout);
 }, []);

 const login = useCallback(async (payload) => {
 const response = await loginUser(payload);
 setTokens(response);
 setToken(response.accessToken);
 setUser(response.user);
 setDashboardRoute(response.dashboardRoute || getDashboardRouteForRole(response.user?.role));
 return response;
 }, []);

 const register = useCallback(async (payload) => {
 const response = await registerUser(payload);
 setTokens(response);
 setToken(response.accessToken);
 setUser(response.user);
 setDashboardRoute(response.dashboardRoute || getDashboardRouteForRole(response.user?.role));
 return response;
 }, []);

 const logout = useCallback(() => {
 clearTokens();
 setToken("");
 setUser(null);
 setDashboardRoute("/user/dashboard");
 }, []);

 const value = useMemo(
 () => ({
 user,
 token,
 dashboardRoute,
 authLoading,
 isAuthenticated: Boolean(token),
 setUser,
 login,
 register,
 logout,
 }),
 [user, token, dashboardRoute, authLoading, login, register, logout]
 );

 return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
 const context = useContext(AuthContext);
 if (!context) {
 throw new Error("useAuth must be used within AuthProvider");
 }
 return context;
}
