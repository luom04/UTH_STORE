import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // luôn kéo về đầu trang mỗi lần pathname đổi
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" }); // hoặc "smooth"
  }, [pathname]);

  return null;
}
