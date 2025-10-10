// src/components/NavBar/NavWithBanner.jsx
import SidebarNav from "./SidebarNav.jsx";
import BannerHome from "../Banner/Banner_Home.jsx";

export default function NavWithBanner({ panelHeight = 360 }) {
  return (
    <section className="max-w-6xl mx-auto px-3 mt-3 relative">
      <div className="flex gap-3 items-stretch">
        {/* Sidebar 20% */}
        <div className="w-[20%] min-w-[220px]">
          <SidebarNav panelHeight={panelHeight} />
        </div>

        {/* Banner 80% */}
        <div className="flex-1 relative">
          <BannerHome panelHeight={panelHeight} />
        </div>
      </div>
    </section>
  );
}
