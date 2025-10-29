// src/pages/Auth/OauthSuccess.jsx
import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { authApi } from "../../api/authApi";
import { PATHS } from "../../routes/paths";
import FullPageLoader from "../../components/Common/FullPageLoader";
import toast from "react-hot-toast";

export default function OauthSuccess() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const ran = useRef(false);

  // Nếu trước đó bị chặn bởi RequireAuth, lấy lại trang đó; không thì về HOME
  const from = location.state?.from?.pathname || PATHS.HOME;

  useEffect(() => {
    if (ran.current) return; // ✅ chặn gọi 2 lần do StrictMode
    ran.current = true;

    (async () => {
      try {
        // Sau khi backend set cookie ở /auth/google/callback, gọi /auth/me để lấy user đầy đủ
        const user = await authApi.me();

        // C1 (nhanh): đặt thẳng cache -> header/profile nhận ngay
        qc.setQueryData(["user"], user);

        // C2 (tuỳ chọn): thay vì setQueryData, có thể:
        // await qc.invalidateQueries({ queryKey: ["user"] });

        toast.success("Đăng nhập Google thành công!");
        navigate(from, { replace: true });
      } catch (e) {
        // Nếu vào đây đa phần là cookie không được trình duyệt lưu:
        // - Kiểm tra SameSite=None, Secure=true, không set domain ở DEV
        // - CORS: credentials: true
        toast.error(e?.message || "Không thể xác thực phiên Google.");
        navigate(PATHS.LOGIN, { replace: true });
      }
    })();
  }, [qc, navigate, from]);

  return <FullPageLoader />;
}
