import { Outlet } from "react-router-dom";
import AccountSidebar from "../components/AccountSideNav";

export default function AccountLayout({ children }) {
  // cho phép truyền children (nếu Route bọc trực tiếp), nếu không dùng Outlet
  return (
    <main className="bg-gray-50">
      <div className="max-w-6xl mx-auto px-3 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:self-start top-4">
            <AccountSidebar />
          </aside>

          <section className="min-h-[60vh] rounded-xl bg-white shadow-sm p-5">
            {children ?? <Outlet />}
          </section>
        </div>
      </div>
    </main>
  );
}
