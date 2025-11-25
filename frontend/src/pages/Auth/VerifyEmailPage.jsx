import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { useGetVerificationStatus } from "../../hooks/useAuth";
import { PATHS } from "../../routes/paths";

export default function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const { isLoading, isSuccess, isError, data, error } =
    useGetVerificationStatus(token);

  useEffect(() => {
    let timer;
    if (isSuccess) {
      timer = setTimeout(() => {
        navigate(PATHS.LOGIN);
      }, 3000);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isSuccess, navigate]);

  // Xác định trạng thái
  let status = "loading";
  if (!token) status = "invalid";
  else if (isError) status = "error";
  else if (isSuccess) status = "success";

  // Lấy message an toàn
  const getMessage = () => {
    switch (status) {
      case "invalid":
        return "Đường dẫn xác thực không hợp lệ.";
      case "loading":
        return "Đang xác thực thông tin...";
      case "success":
        return typeof data?.message === "string"
          ? data.message
          : "Xác thực thành công!";
      case "error":
        return typeof error?.message === "string"
          ? error.message
          : "Mã xác thực không hợp lệ hoặc đã hết hạn.";
      default:
        return "";
    }
  };

  // Lấy title
  const getTitle = () => {
    switch (status) {
      case "loading":
        return "Vui lòng đợi...";
      case "success":
        return "Thành công!";
      case "error":
        return "Xác thực thất bại";
      case "invalid":
        return "Lỗi đường dẫn";
      default:
        return "";
    }
  };

  // Lấy icon
  const getIcon = () => {
    switch (status) {
      case "loading":
        return (
          <div className="animate-spin text-blue-500">
            <Loader2 size={64} strokeWidth={1.5} />
          </div>
        );
      case "success":
        return (
          <div className="text-green-500">
            <CheckCircle size={64} strokeWidth={1.5} />
          </div>
        );
      case "error":
        return (
          <div className="text-red-500">
            <XCircle size={64} strokeWidth={1.5} />
          </div>
        );
      case "invalid":
        return (
          <div className="text-amber-500">
            <AlertTriangle size={64} strokeWidth={1.5} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex items-center justify-center p-4"
      translate="no"
    >
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
        {/* Icon */}
        <div className="flex justify-center mb-6">{getIcon()}</div>

        {/* Title */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          <span>{getTitle()}</span>
        </h1>

        {/* Message */}
        <div className="text-gray-600 mb-8 text-base">
          <span>{getMessage()}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {status === "success" && (
            <div className="text-sm text-gray-400 animate-pulse">
              <span>Đang chuyển hướng đến trang đăng nhập...</span>
            </div>
          )}

          {(status === "error" || status === "invalid") && (
            <button
              type="button"
              onClick={() => navigate(PATHS.LOGIN)}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
            >
              Quay lại đăng nhập
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
