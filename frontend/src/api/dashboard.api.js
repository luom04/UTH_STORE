// src/api/dashboard.api.js
import axiosInstance from "./axiosInstance";

export const dashboardApi = {
  getStats: async () => {
    const { data } = await axiosInstance.get("/dashboard");
    return data; // { success, data }
  },

  // Thêm mới
  saveNote: async (noteContent) => {
    const { data } = await axiosInstance.post("/dashboard/note", {
      content: noteContent,
    });
    return data; // { success, data: note }
  },

  // ✅ Sửa ghi chú
  updateNote: async (noteId, content) => {
    const { data } = await axiosInstance.put(`/dashboard/note/${noteId}`, {
      content,
    });
    return data;
  },

  // ✅ Xóa ghi chú
  deleteNote: async (noteId) => {
    const { data } = await axiosInstance.delete(`/dashboard/note/${noteId}`);
    return data;
  },
};
