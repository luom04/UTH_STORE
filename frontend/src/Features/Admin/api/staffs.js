// src/Features/Admin/api/staffs.js

// Lấy danh sách nhân viên (admin & staff đều được xem)
export async function fetchStaffs({ page = 1, limit = 20, q = "" }) {
  // BE gợi ý: GET /api/v1/admin/staffs?page=1&limit=20&q=...
  // const res = await fetch(`/api/v1/admin/staffs?page=${page}&limit=${limit}&q=${encodeURIComponent(q)}`, { credentials: "include" });
  // if (!res.ok) throw new Error("Failed to fetch staffs");
  // return await res.json();

  // Fallback mock
  return {
    success: true,
    data: [
      {
        id: "U0001",
        name: "Nguyễn Admin",
        email: "admin@uth.vn",
        role: "admin",
        active: true,
        lastLoginAt: "2025-10-10T10:00:00.000Z",
      },
      {
        id: "U0002",
        name: "Trần Nhân Viên",
        email: "staff1@uth.vn",
        role: "staff",
        active: true,
        lastLoginAt: "2025-10-11T08:15:00.000Z",
      },
      {
        id: "U0003",
        name: "Lê Nhân Viên",
        email: "staff2@uth.vn",
        role: "staff",
        active: false,
        lastLoginAt: null,
      },
    ],
    meta: { page, limit, total: 3 },
  };
}

// Chỉ ADMIN
export async function createStaff({ name, email, password }) {
  // POST /api/v1/admin/staffs
  // const res = await fetch(`/api/v1/admin/staffs`, {
  //   method: "POST",
  //   credentials: "include",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify({ name, email, password })
  // });
  // if (!res.ok) throw new Error("Failed to create staff");
  // return await res.json();

  return {
    success: true,
    data: { id: crypto.randomUUID(), name, email, role: "staff", active: true },
  };
}

// Chỉ ADMIN (đổi tên/role/active…)
export async function updateStaff({ id, patch }) {
  // PATCH /api/v1/admin/staffs/:id
  // ...
  return { success: true, data: { id, ...patch } };
}

// Chỉ ADMIN
export async function toggleActiveStaff({ id, active }) {
  // PATCH /api/v1/admin/staffs/:id/toggle-active
  return { success: true, data: { id, active } };
}

// Chỉ ADMIN (đặt lại mật khẩu)
export async function resetStaffPassword({ id }) {
  // POST /api/v1/admin/staffs/:id/reset-password
  return { success: true };
}
