// src/components/SideMenu/PolicySideMenu.jsx (Giữ nguyên, chỉ cleanup class cho gọn)

import { NavLink } from "react-router-dom";
import { PATHS } from "../../../routes/paths";

/** Mặc định: menu “Trung tâm hỗ trợ”. Có thể override bằng prop `items`. */
const DEFAULT_MENU = [
  { text: "Hệ thống cửa hàng", path: PATHS.STORE_LOCATOR },
  { text: "Bảng giá thu sản phẩm cũ", path: PATHS.TRADE_IN },
  { text: "Hỗ trợ kỹ thuật tận nơi", path: PATHS.ONSITE_SUPPORT },
  { text: "Tra cứu thông tin bảo hành", path: PATHS.WARRANTY_LOOKUP },
  { text: "Chính sách giao hàng", path: PATHS.SHIPPING_POLICY },
  { text: "Chính sách bảo hành", path: PATHS.WARRANTY_POLICY },
  { text: "Thanh toán", path: "/thanh-toan" },
  { text: "Mua hàng trả góp", path: PATHS.INSTALLMENT_INSTRUCTIONS },
  { text: "Hướng dẫn mua hàng", path: PATHS.HOME },
  { text: "Chính sách bảo mật", path: PATHS.PRIVACY_POLICY },
  { text: "Điều khoản dịch vụ", path: PATHS.TERMS_OF_SERVICE },
  { text: "Dịch vụ vệ sinh miễn phí", path: PATHS.CLEANING_SERVICE },
];

export default function PolicySideMenu({
  items, // optional: nếu truyền thì dùng items này; nếu không dùng DEFAULT_MENU
  className = "",
  title, // optional
}) {
  const menu = items?.length ? items : DEFAULT_MENU;

  return (
    // Loại bỏ hidden md:block nếu muốn kiểm soát hoàn toàn trên layout
    // Giữ nguyên thiết kế nền trắng và shadow
    <aside
      className={`rounded-xl border border-gray-100 bg-white shadow-lg ${className}`}
    >
      {title ? (
        <div className="px-4 py-3 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
        </div>
      ) : null}

      <ul className="divide-y divide-gray-100 text-sm">
        {menu.map((it) => (
          <li key={it.path}>
            <NavLink
              to={it.path}
              className={({ isActive }) =>
                [
                  // Đổi hover:underline thành hover:bg-gray-100 để đẹp hơn trên nền trắng
                  "block w-full px-4 py-3 text-left transition duration-150 ease-in-out",
                  isActive
                    ? "bg-indigo-50 font-medium text-indigo-700 border-l-4 border-indigo-600 pl-3" // Thêm border trái làm điểm nhấn active
                    : "text-gray-700 hover:bg-gray-50",
                ].join(" ")
              }
            >
              {it.text}
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
}
