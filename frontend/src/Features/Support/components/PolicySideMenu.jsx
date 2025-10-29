// src/components/SideMenu/PolicySideMenu.jsx
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
    <aside
      className={`hidden md:block rounded-xl border border-gray-100 bg-white shadow-sm ${className}`}
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
                  "block w-full px-4 py-3 text-left hover:text-blue-600 hover:underline",
                  isActive
                    ? "bg-gray-50 font-medium text-gray-900"
                    : "text-gray-700",
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
