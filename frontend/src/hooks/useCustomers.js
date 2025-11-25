import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { customerApi } from "../api/customer.api";
import toast from "react-hot-toast"; // ✅ Import Toast

/**
 * 1. Lấy danh sách khách hàng (có lọc & phân trang)
 */
export function useCustomers({ page = 1, q = "", status = "" }) {
  return useQuery({
    queryKey: ["adminCustomers", { page, q, status }],
    queryFn: () => customerApi.getAll({ page, limit: 10, q, status }),
    select: (res) => res.data,
    keepPreviousData: true,
  });
}

/**
 * 2. Lấy thống kê tổng quan (cho các thẻ bài đầu trang)
 */
export function useCustomerStats() {
  return useQuery({
    queryKey: ["adminCustomerStats"],
    queryFn: customerApi.getStats,
    select: (res) => res.data.data,
  });
}

/**
 * 3. Lấy lịch sử đơn hàng của 1 khách cụ thể (Admin xem chi tiết)
 * (Phần này bị thiếu lúc nãy)
 */
export function useCustomerOrders(customerId, page = 1) {
  return useQuery({
    queryKey: ["adminCustomerOrders", { customerId, page }],
    queryFn: () => customerApi.getOrders(customerId, { page, limit: 50 }), // Lấy 50 đơn gần nhất
    enabled: !!customerId, // Chỉ chạy khi có ID khách hàng
    select: (res) => res.data, // Trả về { data: [], meta: {} }
  });
}

/**
 * 4. Các hành động Cập nhật / Chặn / Xóa (Đã tích hợp Toast)
 */
export function useCustomerActions() {
  const qc = useQueryClient();

  // Cập nhật thông tin
  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => customerApi.update(id, data),
    onSuccess: () => {
      toast.success("Cập nhật thông tin thành công! 🎉");
      qc.invalidateQueries({ queryKey: ["adminCustomers"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi cập nhật thông tin");
    },
  });

  // Chặn / Mở khóa
  const blockMutation = useMutation({
    mutationFn: ({ id, block }) => customerApi.toggleBlock(id, block),
    onSuccess: (_, variables) => {
      const msg = variables.block
        ? "Đã chặn khách hàng này "
        : "Đã mở khóa tài khoản ";
      toast.success(msg);
      qc.invalidateQueries({ queryKey: ["adminCustomers"] });
      qc.invalidateQueries({ queryKey: ["adminCustomerStats"] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi thao tác");
    },
  });

  // Xóa khách hàng
  const deleteMutation = useMutation({
    mutationFn: (id) => customerApi.delete(id),
    onSuccess: () => {
      toast.success("Đã xóa khách hàng vĩnh viễn ");
      qc.invalidateQueries({ queryKey: ["adminCustomers"] });
      qc.invalidateQueries({ queryKey: ["adminCustomerStats"] });
    },
    onError: (err) => {
      toast.error(
        err.response?.data?.message || "Không thể xóa khách hàng này"
      );
    },
  });

  return { updateMutation, blockMutation, deleteMutation };
}

// ✅ [CRM HOOK] 5. Lấy chi tiết khách hàng (Profile + Notes)
export function useCustomerDetails(customerId) {
  return useQuery({
    queryKey: ["customerDetails", customerId],
    queryFn: () => customerApi.getDetails(customerId),

    select: (res) => res.data.data,

    enabled: !!customerId,
  });
}

// ✅ [CRM HOOK] 6. Thêm ghi chú mới
export function useAddCustomerNote() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, content }) => customerApi.addNote(id, content),
    onSuccess: (data, variables) => {
      toast.success("Đã lưu ghi chú 📝");
      // Invalidate đúng cái query key của khách hàng đang xem
      qc.invalidateQueries({ queryKey: ["customerDetails", variables.id] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Lỗi khi lưu ghi chú");
    },
  });
}
