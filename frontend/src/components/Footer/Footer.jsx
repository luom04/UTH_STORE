import { Facebook, Music, Youtube, Users } from "lucide-react";
import { PATHS } from "../../routes/paths";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-10">
      {/* Main Footer Content */}
      <div className="max-w-6xl mx-auto px-3 py-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          {/* Về UTHStore */}
          <div>
            <h3 className="font-bold text-gray-900 mb-3 text-xs">
              VỀ UTH_STORE
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href={PATHS.STORE_LOCATOR}
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
                  href={PATHS.WARRANTY_POLICY}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Chính sách bảo hành
                </a>
              </li>
              <li>
                <a
                  href={PATHS.SHIPPING_POLICY}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Chính sách giao hàng
                </a>
              </li>
              <li>
                <a
                  href={PATHS.PRIVACY_POLICY}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href={PATHS.TERMS_OF_SERVICE}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Điều khoản dịch vụ
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
                  href={PATHS.STORE_LOCATOR}
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
                  href={PATHS.INSTALLMENT_INSTRUCTIONS}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Hướng dẫn thanh toán
                </a>
              </li>
              <li>
                <a
                  href={PATHS.INSTALLMENT_INSTRUCTIONS}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Hướng dẫn trả góp
                </a>
              </li>
              <li>
                <a
                  href={PATHS.WARRANTY_LOOKUP}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Tra cứu địa chỉ bảo hành
                </a>
              </li>
              <li>
                <a
                  href="/collections/pc"
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Build PC
                </a>
              </li>
              <li>
                <a
                  href={PATHS.CLEANING_SERVICE}
                  className="text-gray-600 hover:text-orange-500 text-xs"
                >
                  Dịch vụ vệ sinh miễn phí
                </a>
              </li>
            </ul>
          </div>

          {/* Tổng Đài Hỗ Trợ */}
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
            <div className="grid place-items-center grid-cols-2 gap-1 mb-4">
              <img
                src="data:image/png;base64,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"
                alt="GHN"
              />
              <img
                src="data:image/png;base64,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"
                alt="J&T"
              />
            </div>

            <h3 className="font-bold text-gray-900 mb-2 text-xs">
              CÁCH THỨC THANH TOÁN
            </h3>
            <div className="grid grid-cols-3 gap-1">
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-9">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoc5iFDFgwttGjRCHPmDUQtPqIFtv7PbBipw&s"
                  alt="Momo"
                  className="max-h-full object-contain"
                />
              </div>
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-9">
                <img
                  src="data:image/png;base64,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"
                  alt="Visa"
                  className="max-h-full object-contain"
                />
              </div>
              <div className="bg-gray-100 p-1 rounded flex items-center justify-center h-9">
                <img
                  src="data:image/png;base64,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"
                  alt="VNPAY"
                  className="max-h-full object-contain"
                />
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
