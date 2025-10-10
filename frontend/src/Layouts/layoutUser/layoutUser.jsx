// src/components/Layout/Layout.jsx
import { useLocation } from "react-router-dom";
import Header from "../../components/Header/Header.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import NavWithBanner from "../../components/NavBar/NavWithBanner.jsx";

export default function Layout({ children, noFooter = false }) {
  const { pathname } = useLocation();
  const isHome = pathname === "/";

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      {isHome && <NavWithBanner panelHeight={360} />}
      <main className="flex-1">{children}</main>
      {!noFooter && <Footer />}
    </div>
  );
}
