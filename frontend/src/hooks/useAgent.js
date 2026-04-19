import { useState, useEffect, useCallback } from "react";
import agentService from "../services/agentService";

export const useAgent = () => {
 const [agent, setAgent] = useState(null);
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);
 const [isAuthenticated, setIsAuthenticated] = useState(false);

 // Initialize auth state on mount
 useEffect(() => {
 const initializeAuth = async () => {
 try {
 const token = localStorage.getItem("agentToken");
 if (token) {
 const profile = await agentService.getProfile();
 const agentData = profile.data?.agent || profile.data;
 setAgent(agentData);
 setIsAuthenticated(true);
 } else {
 setIsAuthenticated(false);
 }
 } catch (err) {
 console.error("Auth initialization error:", err);
 setError(err.message || "Failed to load profile");
 localStorage.removeItem("agentToken");
 setIsAuthenticated(false);
 } finally {
 setLoading(false);
 }
 };

 initializeAuth();
 }, []);

 const login = useCallback(async (email, password) => {
 try {
 setLoading(true);
 setError(null);
 const response = await agentService.login(email, password);
 const agentData = response.agent || response;
 setAgent(agentData);
 setIsAuthenticated(true);
 return response;
 } catch (err) {
 setError(err.message || "Login failed");
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);

 const register = useCallback(async (userData) => {
 try {
 setLoading(true);
 setError(null);
 const response = await agentService.register(userData);
 return response;
 } catch (err) {
 setError(err.message || "Registration failed");
 throw err;
 } finally {
 setLoading(false);
 }
 }, []);

 const logout = useCallback(async () => {
 try {
 await agentService.logout();
 setAgent(null);
 setIsAuthenticated(false);
 localStorage.removeItem("agentToken");
 } catch (err) {
 console.error("Logout error:", err);
 }
 }, []);

 const updateProfile = useCallback(async (updateData) => {
 try {
 const response = await agentService.updateProfile(updateData);
 const agentData = response.data?.agent || response.data;
 setAgent(agentData);
 return response;
 } catch (err) {
 setError(err.message || "Failed to update profile");
 throw err;
 }
 }, []);

 return {
 agent,
 loading,
 error,
 isAuthenticated,
 login,
 register,
 logout,
 updateProfile,
 };
};
