// src/api/staffs.js
import axiosInstance from "./axiosInstance";

/**
 * Lấy danh sách nhân viên (admin only)
 */
export async function fetchStaffs({ page = 1, limit = 20, q = "" }) {
  const params = { page, limit };
  if (q) params.q = q;

  const res = await axiosInstance.get("/staffs", { params });
  return res.data; // { success, data, meta }
}

/**
 * Tạo nhân viên mới (admin only)
 */
export async function createStaff({ name, email, password, role = "staff" }) {
  const res = await axiosInstance.post("/staffs", {
    name,
    email,
    password,
    role,
  });
  return res.data;
}

/**
 * Cập nhật thông tin nhân viên (admin only)
 */
export async function updateStaff({ id, patch }) {
  const res = await axiosInstance.patch(`/staffs/${id}`, patch);
  return res.data;
}

/**
 * Kích hoạt / Vô hiệu hóa nhân viên (admin only)
 */
export async function toggleActiveStaff({ id, active }) {
  const res = await axiosInstance.put(`/staffs/${id}/toggle-active`, {
    active,
  });
  return res.data;
}

/**
 * Reset password nhân viên (admin only)
 */
// export async function resetStaffPassword({ id }) {
//   const res = await axiosInstance.post(`/staffs/${id}/reset-password`);
//   return res.data;
// }

/**
 * Xóa nhân viên (admin only)
 */
export async function deleteStaff(id) {
  const res = await axiosInstance.delete(`/staffs/${id}`);
  return res.data;
}
