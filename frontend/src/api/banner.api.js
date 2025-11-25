import axiosInstance from "./axiosInstance";

export const bannerApi = {
  getPublic: async () => {
    const { data } = await axiosInstance.get("/banners");
    return data.data;
  },
  getAdmin: async () => {
    const { data } = await axiosInstance.get("/banners/admin");
    return data.data;
  },
  create: async (payload) => axiosInstance.post("/banners", payload),
  update: async (id, payload) => axiosInstance.put(`/banners/${id}`, payload),
  delete: async (id) => axiosInstance.delete(`/banners/${id}`),
};
