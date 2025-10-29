import { useState, useEffect } from "react";
import { Mail, LoaderCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useForgotPassword } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

export default function ForgotPassword() {
  const [email, setEmail] = useState(
    () => localStorage.getItem("remember_email") || ""
  );
  const { mutate: requestReset, isPending } = useForgotPassword();
  const [sent, setSent] = useState(false);

  useEffect(() => {
    document.title = "Quên mật khẩu";
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    requestReset(email.trim(), {
      onSuccess: () => setSent(true),
    });
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
            Quên mật khẩu
          </h1>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Nhập email của bạn. Chúng tôi sẽ gửi liên kết đặt lại mật khẩu nếu
            email tồn tại.
          </p>

          {!sent ? (
            <form className="mt-6 space-y-5" onSubmit={onSubmit}>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-gray-600">
                  Email
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Mail size={18} />
                  </span>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isPending}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2.5 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

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
                      Gửi liên kết đặt lại
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>

              <div className="text-sm text-center">
                <Link
                  to={PATHS.LOGIN}
                  className="text-indigo-600 hover:underline"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </form>
          ) : (
            <div className="mt-6 text-sm text-gray-700 space-y-3">
              <p>
                Nếu email tồn tại, chúng tôi đã gửi một liên kết đặt lại mật
                khẩu đến <strong>{email}</strong>.
              </p>
              <p>Vui lòng kiểm tra hộp thư đến (hoặc mục Spam).</p>
              <div className="text-center">
                <Link
                  to={PATHS.LOGIN}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
