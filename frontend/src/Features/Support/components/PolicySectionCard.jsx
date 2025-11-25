// PolicySectionCard.jsx (Design màu trắng, shadow nhẹ)

import React from "react";

/**
 * Component hiển thị một khối (card) cho mỗi mục trong chính sách.
 * @param {string} title - Tiêu đề của mục.
 * @param {React.ReactNode} children - Nội dung chi tiết của mục.
 */
const PolicySectionCard = ({ title, children }) => {
  return (
    // Thay đổi:
    // - Nền trắng (luôn là trắng, không có dark mode riêng cho card)
    // - Shadow nhẹ: shadow-md hoặc shadow-lg
    // - Border nhẹ để tách biệt nếu cần
    // - Hover effect: subtle shadow increase and border color change
    <section className="bg-white rounded-xl shadow-md border border-gray-100 transition-all duration-300 hover:shadow-lg hover:border-blue-200">
      <div className="p-6 sm:p-8">
        {/* Tiêu đề: Màu chữ đậm, sắc nét trên nền trắng, màu nhấn xanh */}
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 border-b border-gray-100 pb-3 text-blue-600">
          {title}
        </h2>
        {/* Nội dung: Màu chữ xám đậm, dễ đọc */}
        <div className="text-base text-gray-700 max-w-none space-y-4 leading-relaxed">
          {children}
        </div>
      </div>
    </section>
  );
};

export default PolicySectionCard;
