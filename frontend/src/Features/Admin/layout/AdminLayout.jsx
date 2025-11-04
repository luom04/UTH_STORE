//src/Features/Admin/layout/AdminLayout.jsx - WITH DROPDOWN
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LogOut, User, ChevronDown, Home } from "lucide-react"; // ✅ 1. Import icon Home
import AdminSidebar from "../components/AdminSidebar.jsx";
import { ADMIN_PATHS, PATHS } from "../../../routes/paths.jsx";
import { useAuth } from "../../../contexts/AuthContext";

export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="h-14 max-w-7xl mx-auto px-4 flex items-center justify-between">
          {/* ✅ 2. Bọc phần bên trái vào 1 div */}
          <div className="flex items-center gap-4">
            {/* ✅ 3. Thêm nút "Home" */}
            <Link
              to={PATHS.HOME}
              title="Về trang chủ"
              className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors cursor-pointer"
            >
              <Home size={16} />
              <span className="font-medium">Home</span>
            </Link>

            {/* ✅ 4. Thêm dải phân cách */}
            <div className="h-6 w-px bg-gray-200" />

            {/* Left: Title (Giữ nguyên) */}
            <Link to={ADMIN_PATHS.ADMIN_DASHBOARD}>
              <h2 className="text-2xl font-bold text-gray-800 hover:text-red-600 transition-colors duration-200 cursor-pointer">
                Admin Dashboard
              </h2>
            </Link>
          </div>

          {/* Right: User dropdown (Giữ nguyên) */}
          <div className="relative">
            {/* Trigger */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
            >
              {/* User info */}
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-gray-700">
                  {user?.name || "Admin"}
                </div>
                <div className="text-xs text-gray-500 capitalize">
                  {user?.role || "admin"}
                </div>
              </div>

              {/* Avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {(user?.name || "A").charAt(0).toUpperCase()}
              </div>

              {/* Chevron */}
              <ChevronDown
                size={16}
                className={`text-gray-500 transition-transform ${
                  dropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />

                {/* Menu */}
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
                  {/* User info (mobile) */}
                  <div className="px-4 py-3 border-b sm:hidden">
                    <div className="font-medium text-gray-700">
                      {user?.name || "Admin"}
                    </div>
                    <div className="text-sm text-gray-500">{user?.email}</div>
                  </div>

                  {/* Menu items */}
                  <div className="py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`${PATHS.PROFILE}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                    >
                      <User size={16} />
                      Thông tin cá nhân
                    </button>
                  </div>

                  {/* Logout */}
                  <div className="border-t py-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        navigate(`${PATHS.LOGOUT}`);
                      }}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut size={16} />
                      Đăng xuất
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        <aside className="hidden md:block">
          <div className={open ? "block" : "invisible pointer-events-none"}>
            <AdminSidebar />
          </div>
        </aside>

        <main className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
