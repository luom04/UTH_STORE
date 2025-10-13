import { lazy } from "react";
import { PATHS } from "./paths";

// Public pages (lazy)
const Home = lazy(() => import("../pages/Home/Home.jsx"));
const Login = lazy(() => import("../pages/Auth/Login.jsx"));
const Register = lazy(() => import("../pages/Auth/Register.jsx"));
// Kiểu cấu hình gọn: { path, element, layout }
export const ROUTES = [
  // Public
  { path: PATHS.HOME, element: Home, layout: { type: "public" } },
  {
    path: PATHS.LOGIN,
    element: Login,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true },
    },
  },
  {
    path: PATHS.REGISTER,
    element: Register,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true },
    },
  },

  // { path: PATHS.PRODUCT_DETAIL, element: ProductDetail, layout: { type: "public", props: { noBanner: true } } },
  // { path: PATHS.ADMIN, element: AdminDashboard, layout: { type: "admin" } },
];
