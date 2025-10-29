/* eslint-disable no-unused-vars */
import { useState } from "react";
import { motion } from "framer-motion";
import SidebarNav from "./SidebarNav";

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

export default function SidebarNav_Backdrop({ onClose }) {
  // ⬅️ Nhận prop
  const [hoverIdx, setHoverIdx] = useState(null);

  return (
    <motion.div
      variants={slideFromLeft}
      initial="initial"
      animate="animate"
      exit="exit"
      className="fixed top-20 left-0 w-72 h-[calc(100vh-3.5rem)] bg-white shadow-lg z-40 overflow-y-auto"
      onMouseLeave={() => setHoverIdx(null)}
    >
      <aside>
        <SidebarNav hasContainer={false} onClose={onClose} />{" "}
        {/* ⬅️ Truyền xuống */}
      </aside>
    </motion.div>
  );
}
