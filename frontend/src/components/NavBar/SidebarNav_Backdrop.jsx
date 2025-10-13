/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import SidebarNav from "./SidebarNav";

// Đã đổi animation từ y -> x
const slideFromLeft = {
  initial: { x: "-100%", opacity: 0 },
  animate: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" },
  },
};

export default function SidebarNav_Backdrop() {
  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <motion.div
      // Cập nhật tên variants ở đây
      variants={slideFromLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      // Các class TailwindCSS vẫn giữ nguyên
      className="fixed top-14 left-0 w-72 h-[calc(100vh-3.5rem)] bg-white shadow-lg z-40 overflow-y-auto"
      onMouseLeave={() => setHoverIdx(null)}
    >
      <aside>
        <SidebarNav hasContainer={false} />
      </aside>
    </motion.div>
  );
}
