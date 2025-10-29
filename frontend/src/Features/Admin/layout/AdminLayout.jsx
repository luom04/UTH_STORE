import { useState } from "react";
import AdminSidebar from "../components/AdminSidebar.jsx";
import { Link } from "react-router-dom";
import { ADMIN_PATHS } from "../../../routes/paths.jsx";
export default function AdminLayout({ children }) {
  const [open, setOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Topbar */}
      <header className="sticky top-0 z-40 bg-white border-b">
        <div className="h-14 max-w-7xl mx-auto px-4 flex items-center ">
          <Link to={ADMIN_PATHS.ADMIN_DASHBOARD}>
            <h2 className="text-2xl font-bold text-gray-800 hover:text-red-600 transition-colors duration-200 cursor-pointer">
              Admin Dashboard
            </h2>
          </Link>
        </div>
      </header>

      {/* LUÔN là 2 cột trên md: [240px, 1fr] để không đổi chiều rộng content */}
      <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 md:grid-cols-[240px_1fr] gap-6">
        {/* Cột aside luôn tồn tại để giữ layout; chỉ ẩn nội dung khi close */}
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
