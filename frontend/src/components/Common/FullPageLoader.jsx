import React from "react";
import { motion } from "framer-motion";

export default function FullPageLoader() {
  const loadingText = "Loading...";

  const containerVariants = {
    animate: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const letterVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
      <motion.div
        className="flex text-2xl font-semibold text-neutral-600"
        variants={containerVariants}
        initial="initial"
        animate="animate"
        aria-label="Đang tải nội dung"
      >
        {loadingText.split("").map((char, index) => (
          <motion.span
            key={index}
            variants={letterVariants}
            style={{ display: "inline-block", whiteSpace: "pre" }}
          >
            {char}
          </motion.span>
        ))}
      </motion.div>
    </div>
  );
}
