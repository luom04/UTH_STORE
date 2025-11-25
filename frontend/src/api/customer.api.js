import axiosInstance from "./axiosInstance";

export const customerApi = {
  getAll: (params) => axiosInstance.get("/customers", { params }),
  getStats: () => axiosInstance.get("/customers/stats"),
  getOrders: (id, params) =>
    axiosInstance.get(`/customers/${id}/orders`, { params }),
  getDetails: (id) => axiosInstance.get(`/customers/${id}/details`),
  addNote: (id, content) =>
    axiosInstance.post(`/customers/${id}/notes`, { content }),

  update: (id, data) => axiosInstance.put(`/customers/${id}`, data),
  toggleBlock: (id, block) =>
    axiosInstance.patch(`/customers/${id}/block`, { block }),
  delete: (id) => axiosInstance.delete(`/customers/${id}`),
};
