import React, { Suspense, createElement } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./RouteConfig.jsx";

// Layouts
import Layout from "../Layouts/layoutUser/layoutUser.jsx";
import SupportLayout from "../Features/Support/layout/SupportLayout.jsx";
import AccountLayout from "../Features/Account/layout/AccountLayout.jsx";
import AdminLayout from "../Features/Admin/layout/AdminLayout.jsx";

import FullPageLoader from "../components/Common/FullPageLoader.jsx";
import ScrollToTop from "./ScrollToTop.jsx";
import { PublicOnlyRoute, RequireAuth, RequireRole } from "./Guards.jsx";

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <ScrollToTop />
      <Routes>
        {ROUTES.map(({ path, element: Comp, layout, meta }, idx) => {
          // 1️⃣ TẠO COMPONENT GỐC
          let page = createElement(Comp);

          // 2️⃣ APPLY GUARDS TRƯỚC (quan trọng!)
          if (meta?.guestOnly) {
            page = createElement(PublicOnlyRoute, null, page);
          }
          if (meta?.auth) {
            page = createElement(RequireAuth, null, page);
          }
          if (meta?.roles?.length) {
            page = createElement(RequireRole, { allowed: meta.roles }, page);
          }

          // 3️⃣ SAU ĐÓ MỚI WRAP LAYOUT
          if (layout?.type === "admin") {
            page = createElement(AdminLayout, layout.props || {}, page);
          } else if (layout?.type === "support") {
            page = createElement(
              Layout,
              { ...(layout.props || {}), noBanner: true },
              createElement(SupportLayout, null, page)
            );
          } else if (layout?.type === "account") {
            page = createElement(
              Layout,
              { ...(layout.props || {}), noBanner: true },
              createElement(AccountLayout, null, page)
            );
          } else if (layout?.type === "public") {
            page = createElement(Layout, layout.props || {}, page);
          }

          return <Route key={idx} path={path} element={page} />;
        })}
      </Routes>
    </Suspense>
  );
}
