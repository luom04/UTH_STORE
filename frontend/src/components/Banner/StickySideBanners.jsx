// src/components/Banner/StickySideBanners.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useBanners } from "../../hooks/useBanners"; // chú ý path ../../

function buildBannerLink(banner) {
  const target = (banner.linkValue || "").trim();
  if (!target) return "";

  switch (banner.linkType) {
    case "PRODUCT":
      return `/products/${target}`;
    case "CATEGORY":
      return `/collections/${target}`;
    case "EXTERNAL":
    case "CUSTOM":
      return target; // full URL
    default:
      return "";
  }
}

function BannerBox({ banner, position, topOffset }) {
  if (!banner) return null;

  const href = buildBannerLink(banner);
  const isInternal =
    banner.linkType === "PRODUCT" || banner.linkType === "CATEGORY";

  const content = (
    <div className="w-full h-full rounded-lg overflow-hidden shadow-lg border border-gray-100 bg-white group cursor-pointer relative">
      <img
        src={banner.image}
        alt={banner.title || `Banner ${position}`}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
    </div>
  );

  // Nếu không có link, cho hiển thị nhưng không click
  if (!href) {
    return (
      <div
        className={`hidden xl:block fixed z-10 transition-all duration-500 ease-in-out w-[120px] h-[350px] ${
          position === "left" ? "left-4" : "right-4"
        }`}
        style={{ top: `${topOffset}px` }}
      >
        {content}
      </div>
    );
  }

  return (
    <div
      className={`hidden xl:block fixed z-10 transition-all duration-500 ease-in-out w-[120px] h-[350px] ${
        position === "left" ? "left-4" : "right-4"
      }`}
      style={{ top: `${topOffset}px` }}
    >
      {isInternal ? (
        <Link to={href}>{content}</Link>
      ) : (
        <a href={href} target="_blank" rel="noreferrer">
          {content}
        </a>
      )}
    </div>
  );
}

export default function StickySideBanners() {
  const [topOffset, setTopOffset] = useState(150);
  const { data: banners = [] } = useBanners();

  const leftBanner = banners.find((b) => b.type === "side-left");
  const rightBanner = banners.find((b) => b.type === "side-right");

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 50) {
        setTopOffset(100);
      } else {
        setTopOffset(150);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <BannerBox banner={leftBanner} position="left" topOffset={topOffset} />
      <BannerBox banner={rightBanner} position="right" topOffset={topOffset} />
    </>
  );
}
