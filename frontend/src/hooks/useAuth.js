// src/hooks/useAuth.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { authApi } from "../api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { PATHS } from "../routes/paths";

// Hook cho Register
export function useRegister() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: authApi.register,
    onSuccess: () => {
      toast.success("Đăng ký thành công! Vui lòng đăng nhập.");
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
      // ép React Query refetch /auth/me để lấy user đầy đủ (phone/gender/dob)
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toast.success("Đăng nhập thành công!");
    },
    onError: (error) => {
      toast.error(error.message || "Đăng nhập thất bại");
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
