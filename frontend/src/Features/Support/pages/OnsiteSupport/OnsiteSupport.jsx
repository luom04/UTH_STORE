// src/Features/Support/pages/OnsiteSupport.jsx
import { Link } from "react-router-dom";

function SectionTitle({ children }) {
  return (
    <h2 className="mt-6 mb-3 text-lg font-semibold text-gray-900">
      {children}
    </h2>
  );
}

function ComboCard({ title, price, note, bullets }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
      <div className="flex items-center gap-2">
        <h3 className="text-base font-bold text-gray-900">{title}</h3>
        <span className="ml-auto rounded-lg bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-600">
          {price}
        </span>
      </div>
      {note ? (
        <p className="mt-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
          {note}
        </p>
      ) : null}

      <ul className="mt-3 space-y-2 text-sm text-gray-700 list-disc pl-5">
        {bullets.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>

      <p className="mt-3 text-xs text-gray-500">
        Giá đã gồm VAT. Miễn phí di chuyển &lt; 20km (trong nội thành).
      </p>
    </div>
  );
}

export default function OnsiteSupport() {
  return (
    <div className="space-y-6">
      {/* Banner / intro */}
      <div className="overflow-hidden rounded-xl">
        <img
          alt="ALD Service partnership"
          className="w-full h-40 md:h-52 object-cover"
          src="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?q=80&w=1600&auto=format&fit=crop"
        />
      </div>

      <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-800">
        UTH STORE hợp tác với <b>ALD Service</b> cung cấp dịch vụ kỹ thuật tại
        nhà. Cam kết chất lượng – nhanh chóng – an toàn dữ liệu.
      </div>

      {/* Combo tiết kiệm */}
      <SectionTitle>COMBO DỊCH VỤ – LỰA CHỌN TIẾT KIỆM HƠN</SectionTitle>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ComboCard
          title="COMBO LẮP ĐẶT"
          price="449.000đ"
          note="Tiết kiệm ~35% so với mua lẻ dịch vụ"
          bullets={[
            "Kiểm tra tình trạng linh kiện",
            "Lắp ráp & đi dây gọn",
            "Cài đặt Windows + phần mềm cơ bản",
            "Vệ sinh sơ bộ, test ổn định",
            "Bảo hành 7 ngày kể từ khi hoàn tất dịch vụ",
          ]}
        />
        <ComboCard
          title="COMBO BẢO TRÌ"
          price="549.000đ"
          note="Tiết kiệm ~25% so với mua lẻ dịch vụ"
          bullets={[
            "Kiểm tra, vệ sinh tổng thể PC",
            "Thay keo tản nhiệt CPU (MX4)",
            "Cài đặt Windows + phần mềm cơ bản",
            "Tối ưu hiệu năng, test tải",
            "Bảo hành 7 ngày kể từ khi hoàn tất dịch vụ",
          ]}
        />
      </div>

      {/* Nâng cấp */}
      <SectionTitle>COMBO NÂNG CẤP</SectionTitle>
      <ComboCard
        title="COMBO NÂNG CẤP"
        price="649.000đ"
        note="Dành cho khách cần vệ sinh + lắp thêm linh kiện"
        bullets={[
          "Kiểm tra linh kiện trước khi lắp",
          "Lắp ráp gọn, đi dây thẩm mỹ",
          "Cài đặt Windows + phần mềm cơ bản",
          "Thay keo tản nhiệt CPU (MX4)",
          "Bảo hành 7 ngày",
        ]}
      />

      {/* Dịch vụ lẻ */}
      <SectionTitle>DỊCH VỤ LẺ – BẠN GỌI, KỸ THUẬT CHÚNG TÔI ĐẾN</SectionTitle>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5">
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-800">
          <li>
            ✔️ Vệ sinh PC/AIO/Laptop – tản nhiệt khí: <b>349.000đ</b>
          </li>
          <li>
            ✔️ Vệ sinh PC – tản nhiệt nước (AIO): <b>399.000đ</b>
          </li>
          <li>
            ✔️ Cài đặt Windows + phần mềm cơ bản: <b>349.000đ</b>
          </li>
          <li>
            ✔️ Nâng cấp linh kiện (lắp đặt): <b>349.000đ</b>
          </li>
          <li>
            ✔️ Bảo trì máy tính tại nhà: <b>349.000đ</b>
          </li>
          <li>
            ✔️ Vệ sinh ghế/ni-lưới: <b>399.000đ</b>
          </li>
          <li>
            ✔️ Giao nhận máy (PC, linh kiện): <b>Liên hệ</b>
          </li>
          <li>
            ✔️ Custom PC vệ sinh chuyên sâu: <b>2 – 5 triệu</b>
          </li>
        </ul>
        <p className="mt-3 text-xs text-gray-500">
          Phụ thu ngoài 20km: 21–25km +50k; 26–30km +100k; trước 8h30/ sau 18h
          +150k.
        </p>
      </div>

      {/* Gói thành viên */}
      <SectionTitle>GÓI THÀNH VIÊN — chỉ 999.000đ/năm</SectionTitle>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 text-sm text-gray-800">
        <p className="mb-2 text-amber-700">
          Tiết kiệm ~45% so với mua lẻ dịch vụ. Phù hợp khách cần bảo trì định
          kỳ.
        </p>
        <ul className="list-disc pl-5 space-y-1">
          <li>02 lần/năm sử dụng COMBO BẢO TRÌ</li>
          <li>01 lần/năm dùng dịch vụ lẻ theo nhu cầu</li>
          <li>01 lần hỗ trợ khẩn cấp (khung giờ từ 8h–20h)</li>
          <li>Thời hạn sử dụng: 12 tháng kể từ ngày đăng ký</li>
          <li>Giá đã gồm VAT & phí di chuyển &lt; 20km</li>
        </ul>
      </div>

      {/* CTA + thông tin liên hệ */}
      <SectionTitle>YÊU CẦU DỊCH VỤ</SectionTitle>
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        <Link
          to="#"
          className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-5 py-3 text-white shadow hover:bg-rose-600"
        >
          Click tại đây để đăng ký
        </Link>
        <span className="text-sm text-gray-600">
          (Chúng tôi sẽ gọi xác nhận trong vòng 12 giờ làm việc)
        </span>
      </div>

      <SectionTitle>THÔNG TIN LIÊN HỆ</SectionTitle>
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm p-5 text-sm text-gray-800">
        <p>
          <b>Số điện thoại:</b> 0947.266.276
        </p>
        <p>
          <b>Địa chỉ ALD Service:</b> 34/9 Đ. Phùng Văn Cung, P. Cầu Kiệu, Q.
          Phú Nhuận, TP.HCM
        </p>
        <p className="mt-2 text-gray-600">
          Thời gian làm việc: 08:30 – 18:00 (Thứ 2 – Chủ nhật). Phạm vi hỗ trợ
          tiêu chuẩn: &lt; 30km.
        </p>
      </div>
    </div>
  );
}
