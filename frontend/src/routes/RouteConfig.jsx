import { lazy } from "react";
import { PATHS } from "./paths";

// Public pages (lazy)
const Home = lazy(() => import("../pages/Home/Home.jsx"));

// Kiểu cấu hình gọn: { path, element, layout }
export const ROUTES = [
  // Public
  { path: PATHS.HOME, element: Home, layout: { type: "public" } },

  // Sau này thêm:
  // { path: PATHS.LOGIN, element: Login, layout: { type: "none" } },
  // { path: PATHS.PRODUCT_DETAIL, element: ProductDetail, layout: { type: "public", props: { noBanner: true } } },
  // { path: PATHS.ADMIN, element: AdminDashboard, layout: { type: "admin" } },
];
