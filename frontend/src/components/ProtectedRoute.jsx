import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import Loader from "./Loader";
import { getDashboardRouteForRole, normalizeRole } from "../utils/auth";

/**
 * ProtectedRoute with optional role-based guarding.
 *
 * Usage:
 * <Route element={<ProtectedRoute />}> — any authenticated user
 * <Route element={<ProtectedRoute allowedRoles={["Admin"]} />}> — admin only
 */
export default function ProtectedRoute({ allowedRoles }) {
 const { isAuthenticated, authLoading, user } = useAuth();

 if (authLoading) return <Loader label="Checking session..." />;
 if (!isAuthenticated) return <Navigate to="/login" replace />;

 // Role-based check
 if (allowedRoles && allowedRoles.length > 0) {
 const normalizedUserRole = normalizeRole(user?.role);
 const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

 if (!user || !normalizedAllowedRoles.includes(normalizedUserRole)) {
 return <Navigate to={getDashboardRouteForRole(user?.role)} replace />;
 }
 }

 return <Outlet />;
}
