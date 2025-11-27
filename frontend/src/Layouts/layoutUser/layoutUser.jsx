//src/Layouts/layoutUser/layoutUser.jsx
import { useState } from "react";
import { Toaster } from "react-hot-toast";
import Header from "../../components/Header/Header.jsx";
import StickySideBanner from "../../components/Banner/StickySideBanners.jsx";
import Footer from "../../components/Footer/Footer.jsx";
import Backdrop from "../../components/Backdrop/Backdrop.jsx";
import SidebarNav_Backdrop from "../../components/NavBar/SidebarNav_Backdrop.jsx";
import { AnimatePresence } from "framer-motion";
import ChatWidget from "../../components/Chat/ChatWidget.jsx";
export default function Layout({
  children,
  noHeader = false,
  noFooter = false,
  noBanner = false,
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // 1. Tạo một hàm duy nhất để BẬT/TẮT
  const toggleSidebar = () => {
    // Lấy giá trị state trước đó và đảo ngược nó
    setSidebarOpen((prevState) => !prevState);
  };
  // 2. Giữ lại hàm closeSidebar để dùng cho Backdrop
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {!noHeader && <Header cartCount={5} onMenuClick={toggleSidebar} />}
      {/* spacer để tránh header fixed */}
      <div className="h-20" />

      <main className="flex-1">{children}</main>

      {!noFooter && <Footer />}

      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <Backdrop onClick={closeSidebar} />
            <SidebarNav_Backdrop onClose={closeSidebar} />
          </>
        )}
      </AnimatePresence>

      {/* 3. THÊM COMPONENT Toaster */}
      <Toaster position="top-center" />
      {!noBanner && (
        <>
          <ChatWidget />
          <StickySideBanner />
        </>
      )}
    </div>
  );
}
