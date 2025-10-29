import { Facebook, Music, Youtube, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-3 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Về UTHStore (đã đổi tên) */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-xs">
              VỀ UTH_STORE
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Giới thiệu
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Tuyển dụng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Liên hệ
                </a>
              </li>
            </ul>
          </div>

          {/* Chính Sách */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-xs">CHÍNH SÁCH</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Chính sách bảo mật
                </a>
              </li>
            </ul>
          </div>

          {/* Thông Tin */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-xs">THÔNG TIN</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Hệ thống của hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Hướng dẫn mua hàng
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Hướng dẫn thanh toán
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Hướng dẫn trả góp
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Tra cứu địa chỉ bảo hành
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Build PC
                </a>
              </li>
            </ul>
          </div>

          {/* Tổng Đài Hỗ Trợ - ĐÃ SỬA */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-xs">
              TỔNG ĐÀI HỖ TRỢ (8:00 - 21:00)
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <p className="text-gray-600 text-xs">Mua hàng:</p>
                <a
                  href="tel:19005301"
                  className="text-blue-500 hover:text-blue-600 font-semibold text-xs"
                >
                  1900.5301
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-gray-600 text-xs">Bảo hành:</p>
                <a
                  href="tel:19005325"
                  className="text-blue-500 hover:text-blue-600 font-semibold text-xs"
                >
                  1900.5325
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-gray-600 text-xs">Khiếu nại:</p>
                <a
                  href="tel:18006173"
                  className="text-blue-500 hover:text-blue-600 font-semibold text-xs"
                >
                  1800.6173
                </a>
              </div>
              <div className="flex items-center gap-1.5">
                <p className="text-gray-600 text-xs">Email:</p>
                <a
                  href="mailto:cskh@uthstore.com"
                  className="text-blue-500 hover:text-blue-600 font-semibold text-xs"
                >
                  cskh@uthstore.com
                </a>
              </div>
            </div>
          </div>

          {/* Đơn Vị Vận Chuyển & Thanh Toán */}
          <div>
            <h3 className="font-bold text-gray-900 mb-2 text-xs">
              ĐƠN VỊ VẬN CHUYỂN
            </h3>
            <div className="grid grid-cols-2 gap-1 mb-4">
              {/* Thay bằng logo nếu có */}
              <img
                src="data:image/png;base64,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"
                alt="GHN"
              />
              <img
                src="data:image/png;base64,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"
                alt="ESM"
              />
            </div>

            <h3 className="font-bold text-gray-900 mb-2 text-xs">
              CÁCH THỨC THANH TOÁN
            </h3>
            <div className="grid grid-cols-3 gap-1">
              {/* Thay bằng logo nếu có */}
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-7">
                <span className="text-xs font-semibold text-gray-700">
                  MOMO
                </span>
              </div>
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-7">
                <span className="text-xs font-semibold text-gray-700">
                  VISA
                </span>
              </div>
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-7">
                <span className="text-xs font-semibold text-gray-700">
                  ZaloPay
                </span>
              </div>
            </div>
          </div>
        </div>

        <hr className="my-4 border-gray-200" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Social Links */}
          <div className="flex items-center gap-3 h-14">
            <span className="font-semibold text-gray-900 text-xs">
              KẾT NỐI VỚI CHÚNG TÔI
            </span>
            <div className="flex gap-2">
              <a
                href="#"
                className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full transition"
                title="Facebook"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                className="bg-black hover:bg-gray-800 text-white p-2 rounded-full transition"
                title="TikTok"
              >
                <Music size={16} />
              </a>
              <a
                href="#"
                className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full transition"
                title="YouTube"
              >
                <Youtube size={16} />
              </a>
              <a
                href="#"
                className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full transition"
                title="Zalo"
              >
                <Users size={16} />
              </a>
            </div>
          </div>

          {/* Trust Badge */}
          <a
            href="http://online.gov.vn/Home/WebDetails/113621"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://ngocdang.vn/data/upload/media/images/Da-thong-bao-bo-cong-thuong-original.jpg"
              alt="Đã thông báo Bộ Công Thương"
              className="w-36 h-auto hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-gray-50 border-t border-gray-200 py-3">
        <div className="max-w-6xl mx-auto px-3 text-center text-gray-600 text-xs">
          <p>&copy; 2025 UTHStore. Tất cả quyền được bảo lưu.</p>
        </div>
      </div>
    </footer>
  );
}
