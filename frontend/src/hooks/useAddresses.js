// src/hooks/useAddresses.js
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addressApi } from "../api/addressApi";
import toast from "react-hot-toast";

/** map _id <-> id để UI xài id thống nhất */
const fromApi = (a) => {
  if (!a) return a;
  const { _id, ...rest } = a;
  return { id: _id ?? a.id, ...rest };
};
const toApi = (a) => {
  if (!a) return a;
  const { id, _id, ...rest } = a;
  return { _id: id ?? _id, ...rest };
};

const KEY = ["addresses"];

export default function useAddresses() {
  const qc = useQueryClient();

  // LIST
  const {
    data: list = [],
    isLoading: loading,
    error,
  } = useQuery({
    queryKey: KEY,
    // React Query sẽ truyền { signal } vào queryFn
    queryFn: ({ signal }) =>
      addressApi
        .getAll({ signal })
        .then((arr) => (Array.isArray(arr) ? arr.map(fromApi) : [])),
    staleTime: 5 * 60 * 1000,
  });

  // ADD
  const addMutation = useMutation({
    mutationFn: (payload) => addressApi.add(toApi(payload)).then(fromApi),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData(KEY) || [];
      const temp = { ...payload, id: `temp_${Date.now()}` };
      qc.setQueryData(KEY, [temp, ...prev]);
      return { prev, tempId: temp.id, wantDefault: !!payload.isDefault };
    },
    onError: (err, _payload, ctx) => {
      qc.setQueryData(KEY, ctx?.prev || []);
      toast.error(err?.message || "Thêm địa chỉ thất bại");
    },
    onSuccess: (created, _payload, ctx) => {
      qc.setQueryData(KEY, (curr = []) =>
        curr.map((x) => (x.id === ctx.tempId ? created : x))
      );
      toast.success("Đã thêm địa chỉ");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  // UPDATE
  const updateMutation = useMutation({
    mutationFn: ({ id, patch }) =>
      addressApi.update(id, toApi(patch)).then(fromApi),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData(KEY) || [];
      qc.setQueryData(KEY, (curr = []) =>
        curr.map((x) => (x.id === id ? { ...x, ...patch } : x))
      );
      return { prev };
    },
    onError: (err, _vars, ctx) => {
      qc.setQueryData(KEY, ctx?.prev || []);
      toast.error(err?.message || "Cập nhật thất bại");
    },
    onSuccess: () => {
      toast.success("Đã cập nhật địa chỉ");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  // REMOVE
  const removeMutation = useMutation({
    mutationFn: (id) => addressApi.remove(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData(KEY) || [];
      qc.setQueryData(KEY, (curr = []) => curr.filter((x) => x.id !== id));
      return { prev };
    },
    onError: (err, _id, ctx) => {
      qc.setQueryData(KEY, ctx?.prev || []);
      toast.error(err?.message || "Xoá thất bại");
    },
    onSuccess: () => {
      toast.success("Đã xoá địa chỉ");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  // SET DEFAULT
  const setDefaultMutation = useMutation({
    mutationFn: (id) => addressApi.setDefault(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: KEY });
      const prev = qc.getQueryData(KEY) || [];
      // optimistic: set isDefault cho id
      qc.setQueryData(KEY, (curr = []) =>
        curr.map((x) => ({ ...x, isDefault: x.id === id }))
      );
      return { prev };
    },
    onError: (err, _id, ctx) => {
      qc.setQueryData(KEY, ctx?.prev || []);
      toast.error(err?.message || "Đặt mặc định thất bại");
    },
    onSuccess: () => {
      toast.success("Đã đặt mặc định");
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: KEY });
    },
  });

  return {
    list,
    loading,
    error: error ? error.message : "",
    add: (payload) => addMutation.mutateAsync(payload),
    update: (id, patch) => updateMutation.mutateAsync({ id, patch }),
    remove: (id) => removeMutation.mutateAsync(id),
    setDefault: (id) => setDefaultMutation.mutateAsync(id),
  };
}
