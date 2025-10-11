import { Facebook, Music, Youtube, Users } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200">
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
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-8">
                <span className="text-xs font-semibold text-gray-700">GHN</span>
              </div>
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-8">
                <span className="text-xs font-semibold text-gray-700">EMS</span>
              </div>
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
