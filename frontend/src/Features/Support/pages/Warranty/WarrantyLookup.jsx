// src/Features/Support/pages/WarrantyLookup.jsx

import WarrantySearchForm from "../../components/WarrantySearchForm"; // Import component đã tách

const SOUTH = [
  {
    vendor: "GVN",
    center: "TTBH GEARVN",
    phone: "1800.6975 - Nhánh 2",
    address:
      "TTBH KV Miền Nam: 82 Hoàng Hoa Thám, Phường 12, Quận Tân Bình, TP. Hồ Chí Minh",
  },
  {
    vendor: "LG",
    center: "TTBH LG QUẬN 1",
    phone: "18001503",
    address: "Số 55, Sương Nguyệt Ánh, Phường Bến Thành, Quận 1",
  },
  {
    vendor: "SONY",
    center: "TTBH SONY",
    phone: "1800588885",
    address: "163 Quang Trung, Phường 10, Gò Vấp, TP. Hồ Chí Minh",
  },
  {
    vendor: "ASUS",
    center: "TTBH ASUS",
    phone: "18006588",
    address:
      "EverGrow - The Sarus Building, 67 Nguyễn Thị Minh Khai, P. Bến Thành, Quận 1, TP. HCM",
  },
  {
    vendor: "DELL",
    center: "TTBH DELL",
    phone: "028 3842 4342",
    address: "23 Nguyễn Thị Huỳnh, Phường 8, Quận Phú Nhuận, TP. Hồ Chí Minh",
  },
  {
    vendor: "MSI",
    center: "TTBH MSI LINH KIỆN",
    phone: "028 66732331",
    address: "133/16 Huỳnh Mẫn Đạt, Phường 7, Quận 5, TP. Hồ Chí Minh",
  },
  {
    vendor: "ZOTAC",
    center: "TTBH ZOTAC",
    phone: "0987285669",
    address: "69/18 Nguyễn Cửu Đàm, P. Tân Sơn Nhì, Q. Tân Phú, TP. HCM",
  },
  {
    vendor: "ACER",
    center: "TTBH ACER",
    phone: "1900969601",
    address: "585 Điện Biên Phủ, Phường 1, Quận 3, TP. Hồ Chí Minh",
  },
  {
    vendor: "MAI HOANG",
    center: "TTBH MAI HOÀNG",
    phone: "0973196066",
    address: "666/35 Đường 3/2, Phường 14, Quận 10, TP. HCM",
  },
  {
    vendor: "KTC",
    center: "TTBH KHẢI THIÊN",
    phone: "38.341323 - 38.341324",
    address: "384 Nguyễn Thị Minh Khai, Phường 5, Quận 3, TP. Hồ Chí Minh",
  },
  {
    vendor: "SPC",
    center: "TTBH VĨNH XUÂN",
    phone: "0908695396",
    address: "658/21 Cách Mạng Tháng Tám, P.11, Q.3, TP. HCM",
  },
  {
    vendor: "TAN DOANH",
    center: "TTBH TÂN DOANH",
    phone: "028 22006666",
    address: "496 Ba Tháng Hai, Phường 14, Quận 10, TP. HCM",
  },
  // … (thêm các mục còn lại theo danh sách bạn gửi)
];

const NORTH = [
  {
    vendor: "GEARVN THÁI HÀ",
    center: "TTBH GEARVN HN",
    phone: "02877787998",
    address: "162-164 Thái Hà, Trung Liệt, Đống Đa, Hà Nội",
  },
  {
    vendor: "FPT",
    center: "TTBH FPT",
    phone: "02473000911",
    address: "27 Yên Lãng, Trung Liệt, Đống Đa, Hà Nội",
  },
  {
    vendor: "DIGIWORLD",
    center: "TTBH DIGICARE",
    phone: "02473080880",
    address: "106 Ngõ 34 Hoàng Cầu, Ô Chợ Dừa, Đống Đa, Hà Nội",
  },
  {
    vendor: "SPC",
    center: "TTBH VĨNH XUÂN",
    phone: "02473001800",
    address: "150 Thái Hà, Trung Liệt, Đống Đa, Hà Nội",
  },
  {
    vendor: "TSC",
    center: "TTBH TSC",
    phone: "02439656656",
    address: "183 Phố Đặng Tiến Đông, Trung Liệt, Đống Đa, Hà Nội",
  },
  {
    vendor: "HUNG LONG",
    center: "TTBH HƯNG LONG",
    phone: "0987983420",
    address: "Tầng 2, 160 Trần Đại Nghĩa, Bách Khoa, Hai Bà Trưng",
  },
  {
    vendor: "MAI HOANG",
    center: "TTBH MAI HOÀNG",
    phone: "02436285868",
    address: "241 Phố Vọng, Đồng Tâm, Hai Bà Trưng, Hà Nội",
  },
  {
    vendor: "ACER",
    center: "TTBH ACER",
    phone: "01900969601",
    address: "9A Đào Duy Anh, Kim Liên, Đống Đa, Hà Nội",
  },
  {
    vendor: "NINZA",
    center: "TTBH NINZA",
    phone: "02838115086",
    address: "19h1 Trần Kim Xuyến, Yên Hòa, Cầu Giấy, Hà Nội",
  },
  {
    vendor: "KTC",
    center: "TTBH KHẢI THIÊN",
    phone: "0986502468",
    address: "Tầng 3, 14 Trúc Khê, Láng Hạ, Đống Đa, Hà Nội",
  },
  // … (thêm các mục còn lại theo danh sách bạn gửi)
];
/** Reusable scrollable table */
function ScrollTable({ title, rows }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
      <div className="px-4 py-3 border-b text-base font-semibold">{title}</div>

      {/* table container: scroll x+y, ~10 rows high */}
      <div className="overflow-auto max-h-[460px]">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="sticky top-0 bg-gray-50 z-10">
            <tr className="[&>th]:px-3 [&>th]:py-2 text-left text-gray-700">
              <th>Hãng/Nhà cung cấp</th>
              <th>Tên TTBH</th>
              <th>Liên hệ</th>
              <th>Địa chỉ</th>
            </tr>
          </thead>
          <tbody className="[&>tr:nth-child(even)]:bg-gray-50">
            {rows.map((r, i) => (
              <tr key={i} className="[&>td]:px-3 [&>td]:py-2 align-top">
                <td className="font-medium text-gray-800">{r.vendor}</td>
                <td>{r.center}</td>
                <td className="whitespace-pre-line">{r.phone}</td>
                <td className="min-w-[360px]">{r.address}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function WarrantyLookup() {
  return (
    <div className="space-y-6">
      {/* Heading */}
      <header className="space-y-2">
        <h1 className="text-xl font-bold">
          Trung tâm hỗ trợ tra cứu thông tin bảo hành sản phẩm chính hãng
        </h1>
      </header>

      {/* Sử dụng lại component form tra cứu */}
      <WarrantySearchForm />

      <p className="text-sm text-gray-600 !mt-4">
        UTH STORE xin lỗi vì sự cố khiến thiết bị của Quý khách bị hỏng và phải
        đi bảo hành. Dưới đây là danh sách địa chỉ trung tâm bảo hành chính hãng
        để giúp Quý khách tiết kiệm thời gian chờ đợi.
      </p>

      {/* Tables */}
      <div className="space-y-6">
        <ScrollTable
          title="UTH STORE — ĐỊA CHỈ BẢO HÀNH KHU VỰC MIỀN NAM"
          rows={SOUTH}
        />
        <ScrollTable
          title="UTH STORE — ĐỊA CHỈ BẢO HÀNH KHU VỰC MIỀN BẮC"
          rows={NORTH}
        />
      </div>
    </div>
  );
}
