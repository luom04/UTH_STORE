import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import SidebarNav from "../../components/NavBar/SidebarNav.jsx";
import BannerHome from "../../components/Banner/Banner.jsx";

export default function Layout({ children, noFooter = false }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header cartCount={5} />
      <div className="h-14" />
      {isHome && (
        <section className="max-w-6xl mx-auto px-3 mt-3">
          <div className="flex gap-4 items-stretch">
            {/* Sidebar 20% */}
            <div className="w-[20%] min-w-[220px]">
              <SidebarNav />
            </div>

            {/* Banner 80% (slider duy nhất) */}
            <div className="flex-1">
              <BannerHome />
            </div>
          </div>
        </section>
      )}

      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
    </div>
  );
}
