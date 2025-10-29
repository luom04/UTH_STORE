// src/Features/Support/layouts/SupportLayout.jsx
import PolicySideMenu from "../components/PolicySideMenu.jsx";
import { Outlet } from "react-router-dom";

export default function SupportLayout({ children }) {
  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        <PolicySideMenu />
        <section>
          {/* Ưu tiên render children khi bọc trực tiếp; nếu không có thì dùng Outlet */}
          {children ?? <Outlet />}
        </section>
      </div>
    </div>
  );
}
