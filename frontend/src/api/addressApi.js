// src/api/addressesApi.js
import axiosInstance from "./axiosInstance";

export const addressApi = {
  getAll: async () => {
    const { data } = await axiosInstance.get("/addresses");
    return data?.data ?? data;
  },

  add: async (payload) => {
    const { data } = await axiosInstance.post("/addresses", payload);
    return data?.data ?? data;
  },

  update: async (id, payload) => {
    const { data } = await axiosInstance.put(`/addresses/${id}`, payload);
    return data?.data ?? data;
  },

  remove: async (id) => {
    const { data } = await axiosInstance.delete(`/addresses/${id}`);
    return data?.data ?? data;
  },

  setDefault: async (id) => {
    const { data } = await axiosInstance.put(`/addresses/${id}/default`);
    return data?.data ?? data;
  },
};
