import { useState } from "react";
import { useAuth } from "../../../contexts/AuthContext";
import { useUploadToCloudinary } from "../../../hooks/useUploads";
import { useRequestStudentVerify } from "../../../hooks/useAuth";
import {
  Upload,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  School,
  GraduationCap,
} from "lucide-react";
import toast from "react-hot-toast";

export default function StudentVerifyBox() {
  const { user } = useAuth();
  const uploadMut = useUploadToCloudinary();
  const requestMut = useRequestStudentVerify();

  const [schoolName, setSchoolName] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");

  const info = user?.studentInfo || { status: "none" };
  const status = info.status;

  const handleFileChange = (e) => {
    const f = e.target.files[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file && !info.studentIdImage)
      return toast.error("Vui lòng chọn ảnh thẻ");
    if (!schoolName.trim()) return toast.error("Vui lòng nhập tên trường");

    let imageUrl = info.studentIdImage; // Giữ ảnh cũ nếu gửi lại mà ko chọn ảnh mới

    // 1. Upload ảnh nếu có file mới
    if (file) {
      try {
        const toastId = toast.loading("Đang tải ảnh lên...");
        const { url } = await uploadMut.mutateAsync({
          file,
          folder: "students",
        });
        imageUrl = url;
        toast.dismiss(toastId);
      } catch (error) {
        toast.dismiss();
        return; // Dừng nếu upload lỗi (hook upload đã tự toast error)
      }
    }

    // 2. Gửi Request về Backend
    requestMut.mutate({
      studentIdImage: imageUrl,
      schoolName: schoolName,
    });
  };

  const isProcessing = uploadMut.isPending || requestMut.isPending;

  // --- RENDER THEO TRẠNG THÁI ---

  // 1. Đã duyệt (Verified)
  if (status === "verified") {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-5 flex items-start gap-4 animate-fade-in mt-6">
        <div className="p-2 bg-white rounded-full shadow-sm text-emerald-600 border border-emerald-100">
          <CheckCircle2 size={28} />
        </div>
        <div>
          <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
            Xác thực Sinh viên thành công
          </h3>
          <p className="text-emerald-700 text-sm mt-1">
            Chúc mừng <strong>{user.name}</strong>! Tài khoản của bạn đã được
            xác thực là sinh viên. Bạn sẽ được hưởng các ưu đãi giảm giá đặc
            biệt khi mua hàng.
          </p>
          <div className="mt-2 text-xs font-medium text-emerald-600 bg-white px-3 py-1 rounded-lg border border-emerald-100 inline-block shadow-sm">
            🎓 Trường: {info.schoolName}
          </div>
        </div>
      </div>
    );
  }

  // 2. Đang chờ duyệt (Pending)
  if (status === "pending") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start gap-4 animate-fade-in mt-6">
        <div className="p-2 bg-white rounded-full shadow-sm text-amber-600 border border-amber-100">
          <Clock size={28} />
        </div>
        <div>
          <h3 className="font-bold text-amber-800 text-lg">
            Đang chờ xét duyệt
          </h3>
          <p className="text-amber-700 text-sm mt-1">
            Yêu cầu của bạn đã được gửi và đang chờ Admin kiểm tra. Quá trình
            này thường mất từ 1-24 giờ làm việc.
          </p>
          <div className="mt-2 text-xs text-amber-600/80 font-medium">
            Gửi lúc: {new Date(info.submittedAt).toLocaleString("vi-VN")}
          </div>
        </div>
      </div>
    );
  }

  // 3. Form gửi yêu cầu (None hoặc Rejected)
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm mt-6">
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
        <div className="bg-blue-50 p-2 rounded-lg text-blue-600">
          <GraduationCap size={24} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">
            Xác thực Sinh viên
          </h3>
          <p className="text-sm text-gray-500">
            Nhận ngay ưu đãi giảm giá độc quyền cho HSSV
          </p>
        </div>
      </div>

      {/* Thông báo từ chối */}
      {status === "rejected" && (
        <div className="mb-5 p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-sm flex items-start gap-3">
          <XCircle size={18} className="shrink-0 mt-0.5" />
          <div>
            <strong>Yêu cầu trước đó bị từ chối:</strong>
            <p className="mt-1">{info.rejectedReason}</p>
            <p className="text-xs mt-1 opacity-80">
              Vui lòng cập nhật lại thông tin và gửi lại.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Tên trường ĐH/CĐ/THPT
          </label>
          <div className="relative">
            <School
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              className="w-full border rounded-lg pl-9 pr-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition"
              placeholder="VD: Đại Học Giao Thông Vận Tải Thành Phố HCM (UTH)"
              value={schoolName}
              onChange={(e) => setSchoolName(e.target.value)}
              disabled={isProcessing}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Ảnh thẻ Sinh viên / Giấy xác nhận
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition cursor-pointer relative bg-gray-50/50">
            <input
              type="file"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isProcessing}
            />

            {preview || info.studentIdImage ? (
              <div className="relative w-full h-48 rounded-lg overflow-hidden bg-white shadow-sm border">
                <img
                  src={preview || info.studentIdImage}
                  alt="Preview"
                  className="w-full h-full object-contain"
                />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white opacity-0 hover:opacity-100 transition">
                  <p className="text-sm font-medium flex items-center gap-2">
                    <Upload size={16} /> Chọn ảnh khác
                  </p>
                </div>
              </div>
            ) : (
              <div className="py-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <Upload size={24} />
                </div>
                <p className="text-sm font-medium text-gray-900">
                  Nhấn để tải ảnh lên
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Hỗ trợ JPG, PNG, WEBP (Max 5MB)
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isProcessing || !schoolName}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg shadow-blue-200 transition-transform active:scale-95"
          >
            {isProcessing ? (
              <>
                {" "}
                <Loader2 className="animate-spin" size={18} /> Đang xử lý...{" "}
              </>
            ) : status === "rejected" ? (
              "Gửi lại yêu cầu"
            ) : (
              "Gửi yêu cầu xác thực"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
