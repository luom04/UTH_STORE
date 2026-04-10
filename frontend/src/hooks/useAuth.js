// src/hooks/useAuth.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../routes/paths";

// src/hooks/useAuth.js

// ✅ THÊM HOOK NÀY
export function useGetVerificationStatus(token) {
  return useQuery({
    // 1. Key định danh
    queryKey: ["verifyEmail", token],

    // 2. Hàm gọi API (authApi cần trả về data.data hoặc data)
    queryFn: () => authApi.verifyEmail(token),

    // 3. Cấu hình quan trọng
    enabled: !!token, // Chỉ chạy khi có token trên URL
    retry: false, // Lỗi là dừng ngay (Token sai thì thử lại cũng vô ích)
    refetchOnWindowFocus: false, // Không chạy lại khi chuyển tab

    // 4. Cache (Tuỳ chọn): Không lưu cache để user F5 là check lại từ đầu
    cacheTime: 0,
  });
}

// Hook cho Register
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Đăng ký thành công! Vui lòng kiểm tra Email để xác thực.");
      setTimeout(() => navigate(`${PATHS.LOGIN}`), 1500);
    },
    onError: (error) => {
      toast.error(error.message || "Đăng ký thất bại");
    },
  });
}
// Hook cho Login
export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      // Ép React Query refetch /auth/me để lấy user đầy đủ
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đăng nhập thành công!");
    },
    onError: (error) => {
      const status = error.response?.status;
      const message = error.response?.data?.message || error.message;

      // 403 - Account bị khóa hoặc chưa verify email
      if (status === 403) {
        if (message.includes("deactivated")) {
          toast.error(
            " Tài khoản của bạn đã bị khóa. Vui lòng liên hệ quản trị viên."
          );
        } else if (message.includes("verify your email")) {
          toast.error(
            " Vui lòng xác thực email trước khi đăng nhập. Kiểm tra hộp thư của bạn!",
            {
              duration: 5000,
            }
          );
        } else {
          toast.error(message);
        }
      }

      // 401 - Sai thông tin đăng nhập
      else if (status === 401) {
        if (message.includes("Google login")) {
          toast.error(
            "🔐 Tài khoản này sử dụng đăng nhập Google. Vui lòng đăng nhập bằng Google."
          );
        } else {
          // ✅ MẶC ĐỊNH: Sai email/password
          toast.error(" Email hoặc mật khẩu không đúng.");
        }
      }

      // 500 - Server error
      else if (status === 500) {
        toast.error(" Lỗi máy chủ. Vui lòng thử lại sau.");
      }

      // Lỗi khác
      else {
        toast.error(message || "Đăng nhập thất bại. Vui lòng thử lại.");
      }
    },
  });
}
// Hook cho Logout
export function useLogout() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      // Clear all queries
      queryClient.setQueryData(["user"], null);
      toast.success("Đăng xuất thành công!");
      setTimeout(() => navigate(`${PATHS.HOME}`), 1000);
    },
    onError: (error) => {
      toast.error(error.message || "Đăng xuất thất bại");
    },
  });
}

// Hook cho Get Current User
export function useCurrentUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: authApi.me,
    select: (d) => d?.data ?? d, // an toàn nếu backend vẫn bọc
    retry: false,
    staleTime: 10 * 60 * 1000, // 10 phút
  });
}

// Hook cho Forgot Password
export function useForgotPassword() {
  return useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => {
      toast.success("Email khôi phục đã được gửi! Vui lòng kiểm tra hộp thư.");
    },
    onError: (error) => {
      toast.error(error.message || "Không thể gửi email");
    },
  });
}

// Hook cho Reset Password
export function useResetPassword() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.resetPassword,
    onSuccess: () => {
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate(`${PATHS.LOGIN}`), 2000);
    },
    onError: (error) => {
      toast.error(error.message || "Không thể đặt lại mật khẩu");
    },
  });
}

// Hook cho updateUser
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.updateMe,
    onSuccess: (updated) => {
      // merge ngay vào cache user để Header/Sidebar thấy tên mới
      queryClient.setQueryData(["user"], (old) => ({
        ...(old || {}),
        ...updated,
      }));
      toast.success("Đã cập nhật hồ sơ!");
    },
    onError: (error) => {
      toast.error(error.message || "Cập nhật hồ sơ thất bại");
    },
  });
}

// ✅ THÊM HOOK MỚI NÀY VÀO CUỐI FILE
export function useResendVerification() {
  return useMutation({
    mutationFn: (data) => authApi.resendVerification(data), // (Xem Bước 2)
    onSuccess: () => {
      toast.success(
        "Email xác nhận đã được gửi lại! Vui lòng kiểm tra hộp thư."
      );
    },
    onError: (error) => {
      toast.error(error.message || "Gửi email thất bại");
    },
  });
}

export function useAuth() {
  const { data: user, isLoading } = useCurrentUser();

  return {
    user: user || null,
    isAuthenticated: !!user,
    isLoading,
  };
}

export function useRequestStudentVerify() {
  const { refreshUser } = useAuth(); // Hàm reload lại user từ AuthContext
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.requestStudentVerify,

    onSuccess: () => {
      toast.success("Gửi yêu cầu thành công! Vui lòng chờ duyệt.");

      // Load lại thông tin user để cập nhật trạng thái UI ngay lập tức
      queryClient.invalidateQueries({ queryKey: ["pendingStudentRequests"] });

      if (refreshUser) refreshUser();
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Gửi yêu cầu thất bại");
    },
  });
}

// --- ADMIN HOOKS ---

export function usePendingStudentRequests() {
  return useQuery({
    queryKey: ["pendingStudentRequests"],

    queryFn: authApi.getPendingRequests,

    staleTime: 1000 * 60 * 5, // Cache 5 phút
  });
}

export function useVerifyStudentRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authApi.verifyRequest,

    onSuccess: (data) => {
      toast.success(data.message || "Đã xử lý yêu cầu");

      // Reload danh sách sau khi duyệt xong

      queryClient.invalidateQueries({ queryKey: ["pendingStudentRequests"] });
    },

    onError: (error) => {
      toast.error(error.response?.data?.message || "Xử lý thất bại");
    },
  });
}
