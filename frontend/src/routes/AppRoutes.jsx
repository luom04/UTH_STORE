// src/routes/AppRoutes.jsx
import React, { Suspense, createElement } from "react";
import { Routes, Route } from "react-router-dom";
import { ROUTES } from "./RouteConfig.jsx";
import Layout from "../Layouts/layoutUser/layoutUser.jsx";

function FullPageLoader() {
  return (
    <div className="grid min-h-[40vh] place-content-center text-sm text-neutral-600">
      Đang tải…
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<FullPageLoader />}>
      <Routes>
        {ROUTES.map(({ path, element: Comp, layout }, idx) => {
          // dùng createElement để ESLint thấy Comp được sử dụng
          let wrapped = createElement(Comp);

          if (layout?.type === "public") {
            wrapped = createElement(Layout, layout.props || {}, wrapped);
          }
          // if (layout?.type === "admin") wrapped = createElement(AdminLayout, null, wrapped);

          return <Route key={idx} path={path} element={wrapped} />;
        })}
        {/* 404 optional
        <Route path="*" element={<NotFound />} />
        */}
      </Routes>
    </Suspense>
  );
}
