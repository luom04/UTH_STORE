// src/api/chat.api.js
import axiosInstance from "./axiosInstance";

export const chatApi = {
  // Lấy lịch sử chat
  getHistory: async (sessionId) => {
    const res = await axiosInstance.get(`/chats/history/${sessionId}`);
    return res.data; // Trả về { success: true, data: [...] }
  },

  // API lấy danh sách chat cho Admin Dashboard
  getActiveChats: async () => {
    const response = await axiosInstance.get(`/chats/admin/active`);
    return response.data;
  },

  // Admin xóa (ẩn) 1 cuộc trò chuyện khỏi dashboard
  deleteChatAdmin: async (sessionId) => {
    const res = await axiosInstance.delete(`/chats/admin/${sessionId}`);
    return res.data; // { success, message }
  },
};
