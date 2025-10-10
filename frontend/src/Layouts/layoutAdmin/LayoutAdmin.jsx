// src/Layouts/layoutAdmin/LayoutAdmin.jsx
import { Outlet } from "react-router-dom";
export default function LayoutAdmin() {
  return (
    <div className="min-h-screen flex">
      {/* sidebar admin sau này */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
