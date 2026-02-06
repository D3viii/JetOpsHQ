import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function ProtectedRoute({ children, allowRoles }) {
  const { user } = useAuth();
  const location = useLocation();

  // Not logged in -> send to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Logged in but wrong role -> send to dashboard (or an Unauthorized page)
  if (Array.isArray(allowRoles) && allowRoles.length > 0) {
    const roleOk = allowRoles.includes(user.role);
    if (!roleOk) return <Navigate to="/dashboard" replace />;
  }

  return children;
}
