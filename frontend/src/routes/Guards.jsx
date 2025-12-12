// src/routes/guards.jsx

import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { PATHS, ADMIN_PATHS } from "./paths";

function Fallback() {
  return (
    <div className="min-h-[60vh] grid place-items-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-transparent" />
    </div>
  );
}

// ✅ Guest only (login/register)
export function PublicOnlyRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) return <Fallback />;
  if (isAuthenticated) {
    const role = String(user?.role || "").toUpperCase();

    // Nếu là ADMIN hoặc STAFF -> luôn vào dashboard
    if (role === "ADMIN" || role === "STAFF") {
      return <Navigate to={ADMIN_PATHS.ADMIN_DASHBOARD} replace />;
    }

    // Còn lại (CUSTOMER, USER thường) -> về trang trước hoặc HOME
    const from = location.state?.from?.pathname || PATHS.HOME;
    return <Navigate to={from} replace />;
  }

  return children ?? <Outlet />;
}

// ✅ Require signed-in
export function RequireAuth({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <Fallback />;

  if (!isAuthenticated) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />;
  }

  return children ?? <Outlet />;
}

// ✅ Require role (ĐÃ FIX)
export function RequireRole({ allowed = [], children }) {
  const { user, isLoading, isAuthenticated } = useAuth(); // 👈 Thêm isLoading
  const location = useLocation();

  // 🔥 QUAN TRỌNG: Phải check loading trước
  if (isLoading) return <Fallback />;

  // 🔥 Check authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to={PATHS.LOGIN} replace state={{ from: location }} />;
  }

  // 🔥 Check role
  const userRole = String(user.role || "").toUpperCase();
  const allowedRoles = allowed.map((r) => String(r).toUpperCase());

  const hasPermission =
    allowedRoles.length === 0 || allowedRoles.includes(userRole);

  if (!hasPermission) {
    console.warn(
      `❌ Access denied. User role: ${userRole}, Required: ${allowedRoles.join(
        ", "
      )}`
    );
    return <Navigate to={PATHS.FORBIDDEN || PATHS.HOME} replace />;
  }

  return children ?? <Outlet />;
}
