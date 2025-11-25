// src/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { chatApi } from "../api/chat.api";

// ============================================================
// 🟢 CUSTOMER HOOK (Dành cho khách hàng/Chat Widget)
// ============================================================

export const useChatHistory = (sessionId, isOpen) => {
  return useQuery({
    queryKey: ["chat_history", sessionId],
    queryFn: () => chatApi.getHistory(sessionId),

    // Chỉ fetch khi có sessionId VÀ khi người dùng mở khung chat (tiết kiệm request)
    enabled: !!sessionId && isOpen,

    // Cache 5 phút
    staleTime: 1000 * 60 * 5,

    // Giữ cache 10 phút
    gcTime: 1000 * 60 * 10,

    // Trích xuất phần data quan trọng từ response
    select: (response) => response.data || [],
  });
};

// ============================================================
// 🔴 ADMIN HOOK (Dành cho trang quản trị)
// ============================================================

export const useActiveChats = () => {
  return useQuery({
    queryKey: ["admin_active_chats"],
    queryFn: async () => {
      const res = await chatApi.getActiveChats();
      // Đảm bảo luôn trả về mảng để tránh lỗi .map()
      return res.data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

// ✅ HOOK: Admin xóa (ẩn) một cuộc trò chuyện khỏi dashboard
export const useDeleteChatAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (sessionId) => chatApi.deleteChatAdmin(sessionId),
    onSuccess: (_data, sessionId) => {
      // Invalidate lại list active chats để đồng bộ với server
      queryClient.invalidateQueries({ queryKey: ["admin_active_chats"] });

      // (Optional) Bạn cũng có thể làm optimistic update ở AdminChat,
      // nhưng invalidate là đủ an toàn.
      console.log("[useDeleteChatAdmin] deleted session:", sessionId);
    },
    onError: (error, sessionId) => {
      console.error(
        "[useDeleteChatAdmin] error deleting session:",
        sessionId,
        error
      );
    },
  });
};
