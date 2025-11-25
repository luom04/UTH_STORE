// src/Features/Support/layouts/SupportLayout.jsx (Cập nhật để menu dính)

import PolicySideMenu from "../components/PolicySideMenu.jsx";
import { Outlet } from "react-router-dom";

export default function SupportLayout({ children }) {
  return (
    // Đảm bảo không có overflow:hidden nào trên các element cha có thể ngăn sticky hoạt động
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[260px_1fr]">
        {/*
          Thêm các class sau:
          - sticky: Kích hoạt position: sticky
          - top-6: Cố định menu khi nó cách top viewport 6 đơn vị (ví dụ 1.5rem)
          - h-fit: Quan trọng để ngăn sticky component kéo dài toàn bộ chiều cao màn hình 
                   khi nội dung ngắn (height: fit-content)
        */}
        <div className="sticky top-6 h-fit">
          <PolicySideMenu />
        </div>

        <section>
          {/* Ưu tiên render children khi bọc trực tiếp; nếu không có thì dùng Outlet */}
          {children ?? <Outlet />}
        </section>
      </div>
    </div>
  );
}
