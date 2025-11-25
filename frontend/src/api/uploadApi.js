// src/api/uploads.js
import axiosInstance from "./axiosInstance";

/** Ký upload Cloudinary */
export async function apiSignImage({ folder } = {}) {
  const res = await axiosInstance.post("/uploads/sign-image", { folder });
  const data = res.data?.data || res.data || {};
  // bảo đảm có uploadUrl nếu BE đã trả
  return {
    cloudName: data.cloudName,
    apiKey: data.apiKey,
    timestamp: data.timestamp,
    folder: data.folder,
    signature: data.signature,
    uploadUrl: data.uploadUrl, // optional
  };
}

/** Xoá file Cloudinary */
export async function apiDeleteCloudinary({
  publicId,
  resourceType = "image",
}) {
  const res = await axiosInstance.post("/uploads/delete", {
    publicId,
    resourceType,
  });
  return res.data?.data || res.data;
}
