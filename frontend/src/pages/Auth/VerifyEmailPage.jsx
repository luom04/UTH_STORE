// frontend/src/pages/VerifyEmailPage.jsx - BẢN FIX CUỐI CÙNG
import { useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader } from "lucide-react";
import { useGetVerificationStatus } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  // ✅ Dùng useQuery
  // useQuery sẽ tự động chạy khi token tồn tại (nhờ 'enabled: !!token')
  // Nó xử lý StrictMode hoàn hảo
  const { isLoading, isSuccess, isError, data, error } =
    useGetVerificationStatus(token);

  // ✅ Chỉ cần 1 Effect để "Phản ứng" (redirect)
  useEffect(() => {
    if (isSuccess) {
      const timerId = setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 3000);

      // Cleanup timer
      return () => clearTimeout(timerId);
    }
  }, [isSuccess, navigate]);

  // ✅ Logic trạng thái đơn giản
  const status = isLoading
    ? "loading"
    : isSuccess
    ? "success"
    : isError
    ? "error"
    : "loading"; // Mặc định là loading (cho trường hợp !token)

  // ✅ Logic message
  const message = isSuccess
    ? data?.message || "Email đã được xác nhận thành công!"
    : isError
    ? error?.message || "Link xác nhận không hợp lệ hoặc đã hết hạn"
    : "Đang xác nhận email...";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === "loading" && (
            <Loader className="w-16 h-16 text-blue-500 animate-spin" />
          )}
          {status === "success" && (
            <CheckCircle className="w-16 h-16 text-green-500" />
          )}
          {status === "error" && <XCircle className="w-16 h-16 text-red-500" />}
        </div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
          {status === "loading" && "Đang xác nhận email..."}
          {status === "success" && "Xác nhận thành công!"}
          {status === "error" && "Xác nhận thất bại"}
        </h1>

        {/* Message */}
        <p className="text-center text-gray-600 mb-6">{message}</p>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {status === "success" && (
            <div className="text-center text-sm text-gray-500">
              Đang chuyển đến trang đăng nhập...
            </div>
          )}

          {status === "error" && (
            <button
              onClick={() => navigate(PATHS.LOGIN)}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition cursor-pointer"
            >
              Về trang đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
