import { motion } from "framer-motion";

export default function Backdrop({ onClick }) {
  return (
    <motion.div
      onClick={onClick}
      className="fixed inset-0 bg-black/50 z-30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );
}
