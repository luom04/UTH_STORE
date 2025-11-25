// src/hooks/useUploads.js
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { apiSignImage, apiDeleteCloudinary } from "../api/uploadApi";

/**
 * Ký upload Cloudinary (server sinh signature, timestamp, apiKey, cloudName, uploadUrl?)
 * Dùng khi bạn muốn test chữ ký riêng.
 */
export function useSignImage() {
  return useMutation({
    mutationFn: ({ folder } = {}) => apiSignImage({ folder }),
    onError: (err) =>
      toast.error(err?.message || "Không thể lấy chữ ký upload"),
  });
}

/**
 * Upload 1 file lên Cloudinary (tự gọi ký ở trong hook)
 * UI chỉ cần gọi: uploadMut.mutateAsync({ file, folder?: "products", resourceType?: "image" })
 * Trả về: { url, publicId }
 */
export function useUploadToCloudinary() {
  return useMutation({
    mutationFn: async ({
      file,
      folder = "products",
      resourceType = "image", // "image" | "video" | ...
    }) => {
      if (!file) throw new Error("Thiếu file để upload");

      // 1) Ký từ BE
      const sig = await apiSignImage({ folder });
      const { timestamp, signature, apiKey, cloudName, uploadUrl } = sig || {};
      if (!apiKey || !cloudName || !timestamp || !signature) {
        throw new Error("Thiếu chữ ký upload");
      }

      // 2) Upload trực tiếp lên Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", apiKey);
      formData.append("timestamp", timestamp);
      formData.append("signature", signature);
      if (folder) formData.append("folder", folder);

      // Ưu tiên uploadUrl do server trả về, nếu không có thì dùng endpoint chuẩn
      const endpoint =
        uploadUrl ||
        `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;

      const res = await fetch(endpoint, { method: "POST", body: formData });
      if (!res.ok) throw new Error("Upload thất bại");

      const json = await res.json();
      return { url: json.secure_url, publicId: json.public_id };
    },
    onSuccess: () => {
      toast.success("Tải ảnh lên thành công! 📸"); // ✅ Toast ngay trong Hook
    },
    onError: (err) => toast.error(err?.message || "Upload thất bại"),
  });
}

/**
 * Xoá asset trên Cloudinary
 */
export function useDeleteFromCloudinary() {
  return useMutation({
    mutationFn: ({ publicId, resourceType = "image" }) =>
      apiDeleteCloudinary({ publicId, resourceType }),
    onSuccess: () => toast.success("Đã xoá ảnh trên Cloudinary"),
    onError: (err) => toast.error(err?.message || "Xoá ảnh thất bại"),
  });
}
