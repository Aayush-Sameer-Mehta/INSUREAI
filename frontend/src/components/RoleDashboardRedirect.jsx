import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getDashboardRouteForRole } from "../utils/auth";

export default function RoleDashboardRedirect() {
 const { user } = useAuth();
 return <Navigate to={getDashboardRouteForRole(user?.role)} replace />;
}
