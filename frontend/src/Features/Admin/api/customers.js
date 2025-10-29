export async function fetchCustomers({
  page = 1,
  limit = 20,
  q = "",
  status = "",
}) {
  const params = new URLSearchParams({ page, limit, q, status });
  const res = await fetch(`/api/v1/admin/customers?${params.toString()}`, {
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to load customers");
  return await res.json();
}

export async function updateCustomer({ id, payload }) {
  const res = await fetch(`/api/v1/admin/customers/${id}`, {
    method: "PUT",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to update customer");
  return await res.json();
}

export async function toggleBlockCustomer({ id, block }) {
  const res = await fetch(
    `/api/v1/admin/customers/${id}/${block ? "block" : "unblock"}`,
    {
      method: "PATCH",
      credentials: "include",
    }
  );
  if (!res.ok) throw new Error("Failed to toggle block");
  return await res.json();
}

export async function deleteCustomer(id) {
  const res = await fetch(`/api/v1/admin/customers/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete customer");
  return await res.json();
}
