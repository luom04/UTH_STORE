// src/Features/Admin/api/orders.js
const BASE = "";

export async function fetchOrders({ page = 1, limit = 20, status, q }) {
  const params = new URLSearchParams();
  params.set("page", page);
  params.set("limit", limit);
  if (status) params.set("status", status);
  if (q) params.set("q", q);
  const res = await fetch(`${BASE}/admin/orders?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load orders");
  return res.json(); // { success, data, meta }
}

export async function updateOrderStatus(id, nextStatus) {
  const res = await fetch(`${BASE}/admin/orders/${id}/status`, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: nextStatus }),
  });
  if (!res.ok) throw new Error("Failed to update status");
  return res.json(); // { success, data }
}

export async function confirmOrder(id) {
  const res = await fetch(`${BASE}/admin/orders/${id}/confirm`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to confirm order");
  return res.json();
}
