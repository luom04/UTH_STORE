// PolicySectionCard.jsx

import React from "react";

/**
 * Component hiển thị một khối (card) cho mỗi mục trong chính sách.
 * @param {string} title - Tiêu đề của mục.
 * @param {React.ReactNode} children - Nội dung chi tiết của mục.
 */
const PolicySectionCard = ({ title, children }) => {
  return (
    <section className="bg-white dark:bg-slate-800 shadow-md rounded-xl overflow-hidden">
      <div className="p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">
          {title}
        </h2>
        <div className=" text-slate-600 dark:text-slate-400 max-w-none">
          {children}
        </div>
      </div>
    </section>
  );
};

export default PolicySectionCard;
