import { useEffect, useMemo, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { Lock, LoaderCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useResetPassword } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ResetPassword() {
  const location = useLocation();
  const token = useMemo(
    () => new URLSearchParams(location.search).get("token") || "",
    [location.search]
  );
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const { mutate: resetPassword, isPending } = useResetPassword();

  useEffect(() => {
    document.title = "Đặt lại mật khẩu";
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!token) return setError("Liên kết không hợp lệ hoặc đã hết hạn.");
    if (password.length < 8)
      return setError("Mật khẩu phải có ít nhất 8 ký tự.");
    if (password !== confirm) return setError("Xác nhận mật khẩu không khớp.");
    setError("");

    resetPassword({ token, newPassword: password });
  };

  return (
    <div className="min-h-[calc(100vh-56px)] bg-gray-50 grid place-items-center px-4 py-8">
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[420px] rounded-2xl bg-white shadow-xl border border-gray-100"
      >
        <div className="px-6 pb-6 pt-8 sm:px-8">
          <h1 className="text-2xl font-bold text-center text-gray-800">
            Đặt lại mật khẩu
          </h1>

          {!token ? (
            <div className="mt-6 text-center text-sm text-red-600">
              Liên kết đặt lại không hợp lệ hoặc đã hết hạn.
              <div className="mt-3">
                <Link
                  to={PATHS.FORGOT_PASSWORD}
                  className="text-indigo-600 hover:underline"
                >
                  Gửi lại liên kết
                </Link>
              </div>
            </div>
          ) : (
            <form className="mt-6 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">
                  Mật khẩu mới
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">
                  Xác nhận mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={18} />
                  </span>
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={8}
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-red-600 text-center">{error}</div>
              )}

              <button
                type="submit"
                disabled={isPending}
                className="w-full h-11 flex items-center justify-center rounded-lg py-2.5 font-semibold text-white transition-all duration-300
                bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 disabled:bg-indigo-400 disabled:cursor-not-allowed"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isPending ? (
                    <motion.div
                      key="loader"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      <LoaderCircle size={20} className="animate-spin" />
                    </motion.div>
                  ) : (
                    <motion.span
                      key="text"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                    >
                      Cập nhật mật khẩu
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div className="text-sm text-center">
                <Link
                  to={PATHS.LOGIN}
                  className="text-indigo-600 hover:underline"
                >
                  Về trang đăng nhập
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
