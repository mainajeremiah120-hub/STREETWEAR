import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";

export default function ProtectedRoute() {
  const { token, loading } = useAuth();

  if (loading) return <div className="spinner" />;
  if (!token) return <Navigate to="/admin/login" replace />;

  return <Outlet />;
}
