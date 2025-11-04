// Giữ đơn giản: chỉ những path đang có + thêm vài path khung
export const PATHS = {
  // public
  HOME: "/",
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  LOGOUT: "/auth/logout",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/verify-email",
  OAUTH_SUCCESS: "/oauth-success",
  PRODUCT_DETAIL: "/products/:slug",
  CATALOG: "/collections/:slug",
  SEARCH: "/search",
  STORE_LOCATOR: "/stores",
  TRADE_IN: "/bang-gia-thu-cu",
  ONSITE_SUPPORT: "/ho-tro-ky-thuat",
  WARRANTY_LOOKUP: "/tra-cuu-thong-tin-bao-hanh",
  SHIPPING_POLICY: "/chinh-sach-van-chuyen",
  WARRANTY_POLICY: "/chinh-sach-bao-hanh",
  INSTALLMENT_INSTRUCTIONS: "/huong-dan-thanh-toan",
  PRIVACY_POLICY: "/chinh-sach-bao-mat",
  TERMS_OF_SERVICE: "/dieu-khoan-dich-vu",
  CLEANING_SERVICE: "/dich-vu-ve-sinh-mien-phi",

  // checkout
  CART: "/cart",
  CHECKOUT_INFO: "/checkout/info",
  CHECKOUT_PAYMENT: "/checkout/payment",
  CHECKOUT_SUCCESS: "/checkout/success",

  // account (customer)
  ACCOUNT_ROOT: "/account", // 👈 layout gốc (để RequireAuth/RequireRole bọc)
  PROFILE: "/account/profile",
  ADDRESSES: "/account/addresses",
  ACCOUNT_ORDERS: "/account/orders",

  // staff (nhân viên)
  STAFF_DASHBOARD: "/staff", // 👈 entry cho luồng STAFF

  // trạng thái/khác
  FORBIDDEN: "/403", // 👈 cho guard từ chối quyền
  NOT_FOUND: "*", // 👈 404
};

export const ADMIN_PATHS = {
  ADMIN_LOGIN: "/admin/login",
  ADMIN_DASHBOARD: "/admin",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_ORDER_DETAIL: "/admin/orders/:id",
  ADMIN_PRODUCTS: "/admin/products",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_STAFFS: "/admin/staffs", // 👈 thêm trang quản lý nhân viên
};
