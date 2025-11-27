// src/routes/RouteConfig.jsx
import { lazy } from "react";
import { PATHS, ADMIN_PATHS } from "./paths.jsx";

// Admin
const DashboardAdmin = lazy(() =>
  import("../Features/Admin/pages/DashboardAdmin.jsx")
);
const AdminOrders = lazy(() =>
  import("../Features/Admin/pages/OrdersPage.jsx")
);
const StaffsPage = lazy(() => import("../Features/Admin/pages/StaffsPage.jsx"));
const ProductsPage = lazy(() =>
  import("../Features/Admin/pages/ProductsPage.jsx")
);
const CustomersPage = lazy(() =>
  import("../Features/Admin/pages/CustomersPage.jsx")
);
const AdminReviewsPage = lazy(() =>
  import("../Features/Admin/pages/ReviewsPage.jsx")
);

const ReportsPage = lazy(() =>
  import("../Features/Admin/pages/ReportsPage.jsx")
);
const BannerManager = lazy(() =>
  import("../Features/Admin/pages/BannerManager.jsx")
);
const CouponManager = lazy(() =>
  import("../Features/Admin/pages/CouponManager.jsx")
);
const ChatsManager = lazy(() =>
  import("../Features/Admin/pages/AdminChat.jsx")
);

//public
const Home = lazy(() => import("../pages/Home/Home.jsx"));
const Login = lazy(() => import("../pages/Auth/Login.jsx"));
const Register = lazy(() => import("../pages/Auth/Register.jsx"));
const LogoutPage = lazy(() => import("../pages/Auth/Logout.jsx"));
const OauthSuccess = lazy(() => import("../pages/Auth/OauthSuccess.jsx"));
const ForgotPassword = lazy(() => import("../pages/Auth/ForgotPassword.jsx"));
const ResetPassword = lazy(() => import("../pages/Auth/ResetPassword.jsx"));
const VerifyEmail = lazy(() => import("../pages/Auth/VerifyEmailPage.jsx"));
const ProductDetail = lazy(() => import("../pages/Products/ProductDetail.jsx"));
const Cart = lazy(() => import("../pages/Cart/Cart.jsx"));
const CheckoutInfo = lazy(() => import("../pages/Cart/CheckoutInfo.jsx"));
const CheckoutPayment = lazy(() => import("../pages/Cart/CheckoutPayment.jsx"));
const CheckoutSuccess = lazy(() => import("../pages/Cart/CheckoutSuccess.jsx"));
const Catalog = lazy(() => import("../pages/Catalog/CatalogPage.jsx"));
const Search = lazy(() => import("../pages/Search/Search.jsx"));

//profile (customer)
const Profile = lazy(() => import("../Features/Account/pages/Profile.jsx"));
const Addresses = lazy(() => import("../Features/Account/pages/Addresses.jsx"));
const Orders = lazy(() => import("../Features/Account/pages/Orders.jsx"));

//support
const StoreLocator = lazy(() =>
  import("../Features/Support/pages/Store/StoreLocator.jsx")
);
const TradeIn = lazy(() =>
  import("../Features/Support/pages/TradeIn/TradeIn.jsx")
);
const OnsiteSupport = lazy(() =>
  import("../Features/Support/pages/OnsiteSupport/OnsiteSupport.jsx")
);
const WarrantyLookup = lazy(() =>
  import("../Features/Support/pages/Warranty/WarrantyLookup.jsx")
);
const ShippingPolicy = lazy(() =>
  import("../Features/Support/pages/ShippingPolicy/ShippingPolicy.jsx")
);
const WarrantyPolicy = lazy(() =>
  import("../Features/Support/pages/Warranty/WarrantyPolicy.jsx")
);
const Installment = lazy(() =>
  import(
    "../Features/Support/pages/InstallmentInstructions/InstallmentInstructions.jsx"
  )
);
const PrivacyPolicy = lazy(() =>
  import("../Features/Support/pages/PrivacyPolicy/PrivacyPolicy.jsx")
);
const TermsOfService = lazy(() =>
  import("../Features/Support/pages/TermsOfService/TermsOfService.jsx")
);
const CleaningService = lazy(() =>
  import("../Features/Support/pages/CleaningService/CleaningService.jsx")
);

const Forbidden = lazy(() => import("../pages/System/Forbidden.jsx")); // tạo stub nếu chưa có
const NotFound = lazy(() => import("../pages/System/NotFound.jsx")); // tạo stub nếu chưa có

export const ROUTES = [
  // ===== public (ai cũng vào được) =====
  { path: PATHS.HOME, element: Home, layout: { type: "public" } },
  {
    path: PATHS.PRODUCT_DETAIL,
    element: ProductDetail,
    layout: { type: "public" },
  },
  {
    path: PATHS.CART,
    element: Cart,
    layout: { type: "public" },
    meta: { auth: true, roles: ["customer", "staff", "admin"] },
  },
  {
    path: PATHS.CHECKOUT_INFO,
    element: CheckoutInfo,
    layout: { type: "public" },
  },
  {
    path: PATHS.CHECKOUT_PAYMENT,
    element: CheckoutPayment,
    layout: { type: "public" },
    meta: { auth: true, roles: ["customer", "staff", "admin"] }, // ✅
  },
  {
    path: PATHS.CHECKOUT_SUCCESS,
    element: CheckoutSuccess,
    layout: { type: "public" },
    meta: { auth: true, roles: ["customer", "staff", "admin"] }, // ✅
  },
  { path: PATHS.CATALOG, element: Catalog, layout: { type: "public" } },
  { path: PATHS.SEARCH, element: Search, layout: { type: "public" } },

  // ===== auth pages -> chỉ cho GUEST (chưa đăng nhập) =====
  {
    path: PATHS.LOGIN,
    element: Login,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true, noBanner: true },
    },
    meta: { guestOnly: true },
  },
  {
    path: PATHS.REGISTER,
    element: Register,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true, noBanner: true },
    },
    meta: { guestOnly: true },
  },
  {
    path: PATHS.LOGOUT,
    element: LogoutPage,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true },
    },
  },
  {
    path: PATHS.FORGOT_PASSWORD,
    element: ForgotPassword,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true, noBanner: true },
    },
    meta: { guestOnly: true },
  },
  {
    path: PATHS.RESET_PASSWORD,
    element: ResetPassword,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true, noBanner: true },
    },
    meta: { guestOnly: true },
  },
  {
    path: PATHS.VERIFY_EMAIL,
    element: VerifyEmail,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true, noBanner: true },
    },
    meta: { guestOnly: true },
  },
  {
    path: PATHS.OAUTH_SUCCESS,
    element: OauthSuccess,
    layout: {
      type: "public",
      props: { noBanner: true, noFooter: true, noHeader: true, noBanner: true },
    },
  },
  // ===== customer (đã đăng nhập + role CUSTOMER) =====
  {
    path: PATHS.PROFILE,
    element: Profile,
    layout: { type: "account" },
    meta: { auth: true, roles: ["customer", "staff", "admin"] },
  },
  {
    path: PATHS.ADDRESSES,
    element: Addresses,
    layout: { type: "account" },
    meta: { auth: true, roles: ["customer", "staff", "admin"] },
  },
  {
    path: PATHS.ACCOUNT_ORDERS,
    element: Orders,
    layout: { type: "account" },
    meta: { auth: true, roles: ["customer", "staff", "admin"] },
  },

  // ===== support =====
  {
    path: PATHS.STORE_LOCATOR,
    element: StoreLocator,
    layout: { type: "support" },
  },
  { path: PATHS.TRADE_IN, element: TradeIn, layout: { type: "support" } },
  {
    path: PATHS.ONSITE_SUPPORT,
    element: OnsiteSupport,
    layout: { type: "support" },
  },
  {
    path: PATHS.WARRANTY_LOOKUP,
    element: WarrantyLookup,
    layout: { type: "support" },
  },
  {
    path: PATHS.SHIPPING_POLICY,
    element: ShippingPolicy,
    layout: { type: "support" },
  },
  {
    path: PATHS.WARRANTY_POLICY,
    element: WarrantyPolicy,
    layout: { type: "support" },
  },
  {
    path: PATHS.INSTALLMENT_INSTRUCTIONS,
    element: Installment,
    layout: { type: "support" },
  },
  {
    path: PATHS.PRIVACY_POLICY,
    element: PrivacyPolicy,
    layout: { type: "support" },
  },
  {
    path: PATHS.TERMS_OF_SERVICE,
    element: TermsOfService,
    layout: { type: "support" },
  },
  {
    path: PATHS.CLEANING_SERVICE,
    element: CleaningService,
    layout: { type: "support" },
  },

  // ===== admin/staff =====
  {
    path: ADMIN_PATHS.ADMIN_DASHBOARD,
    element: DashboardAdmin,
    layout: { type: "admin" }, // 👈 layout admin riêng
    meta: { auth: true, roles: ["staff", "admin"] }, // cả STAFF và ADMIN vào được
  },
  {
    path: ADMIN_PATHS.ADMIN_ORDERS,
    element: AdminOrders,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] },
  },
  {
    path: ADMIN_PATHS.ADMIN_STAFFS,
    element: StaffsPage,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["admin"] }, // 👈 chỉ ADMIN
  },
  {
    path: ADMIN_PATHS.ADMIN_PRODUCTS, // "/admin/products"
    element: ProductsPage,
    layout: { type: "admin" }, // dùng AdminLayout
    meta: { auth: true, roles: ["staff", "admin"] },
  },
  {
    path: ADMIN_PATHS.ADMIN_CUSTOMERS,
    element: CustomersPage,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] }, // cả staff & admin được vào
  },
  {
    path: ADMIN_PATHS.ADMIN_REVIEWS,
    element: AdminReviewsPage,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] },
  },
  {
    path: ADMIN_PATHS.ADMIN_REPORTS,
    element: ReportsPage,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] },
  },
  {
    path: ADMIN_PATHS.ADMIN_BANNERS,
    element: BannerManager,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] },
  },
  {
    path: ADMIN_PATHS.ADMIN_COUPONS,
    element: CouponManager,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] },
  },
  {
    path: ADMIN_PATHS.ADMIN_CHATS,
    element: ChatsManager,
    layout: { type: "admin" },
    meta: { auth: true, roles: ["staff", "admin"] },
  },

  // ===== status =====
  {
    path: PATHS.FORBIDDEN,
    element: Forbidden,
    layout: { type: "public", props: { noBanner: true } },
  },
  {
    path: PATHS.NOT_FOUND,
    element: NotFound,
    layout: { type: "public", props: { noBanner: true } },
  },
];
