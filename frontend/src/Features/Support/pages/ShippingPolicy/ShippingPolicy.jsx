// src/Features/Support/pages/ShippingPolicy/ShippingPolicy.jsx
import React from "react";

const FEE_ROWS = [
  {
    label: "Đơn hàng dưới 5 triệu đồng",
    hcmhn: "40.000 vnd",
    ngoai: "Không áp dụng",
  },
  {
    label: "Đơn hàng trên 5 triệu đồng",
    hcmhn: "Miễn phí",
    ngoai: "Không áp dụng",
  },
];

const TIME_ROWS = [
  {
    route: "Hồ Chí Minh → Hồ Chí Minh\nHà Nội → Hà Nội",
    area: "Nội/Ngoại thành",
    eta: "1 – 2 ngày",
  },
  {
    route: "Hồ Chí Minh → Miền Nam\nHà Nội → Miền Bắc",
    area: "Trung tâm Tỉnh/TP/Thị xã",
    eta: "3 – 4 ngày",
  },
  {
    route: "Hồ Chí Minh → Miền Nam\nHà Nội → Miền Bắc",
    area: "Huyện, xã",
    eta: "4 – 5 ngày",
  },
  {
    route: "Hồ Chí Minh → Miền Trung\nHà Nội → Miền Trung",
    area: "Trung tâm Tỉnh/TP/Thị xã",
    eta: "4 – 6 ngày",
  },
  {
    route: "Hồ Chí Minh → Miền Trung\nHà Nội → Miền Trung",
    area: "Huyện, xã",
    eta: "5 – 7 ngày",
  },
  {
    route: "Hồ Chí Minh → Miền Bắc\nHà Nội → Miền Nam",
    area: "Trung tâm Tỉnh/TP/Thị xã",
    eta: "5 – 7 ngày",
  },
  {
    route: "Hồ Chí Minh → Miền Bắc\nHà Nội → Miền Nam",
    area: "Huyện, xã",
    eta: "5 – 7 ngày",
  },
];

export default function ShippingPolicy() {
  return (
    <div className="space-y-6">
      {/* Title */}
      <h1 className="text-2xl font-bold">Chính sách vận chuyển</h1>

      {/* Intro */}
      <div className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 leading-relaxed text-[15px] text-gray-700">
        <p className="mb-2">
          UTH Store cung cấp dịch vụ giao hàng toàn quốc, giao tận nơi đến địa
          chỉ quý khách. Thời gian giao hàng dự kiến phụ thuộc vào kho xuất hàng
          và địa chỉ nhận hàng của quý khách.
        </p>
        <p>
          Với đa phần đơn hàng, chúng tôi cần một khoảng thời gian ngắn để kiểm
          tra và đóng gói. Nếu sản phẩm hiện có sẵn, UTH Store sẽ cố gắng bàn
          giao cho đối tác vận chuyển sớm nhất.
        </p>
      </div>

      {/* Fee table */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-3">Phí dịch vụ giao hàng</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="border p-3 text-left w-[40%]">
                  Giá trị đơn hàng
                </th>
                <th className="border p-3 text-left">
                  Khu vực HCM/HN
                  <br />
                  <span className="font-normal">(Giao nhanh 2h–4h)</span>
                </th>
                <th className="border p-3 text-left">
                  Khu vực Ngoại thành / Tỉnh
                </th>
              </tr>
            </thead>
            <tbody>
              {FEE_ROWS.map((r) => (
                <tr key={r.label} className="hover:bg-gray-50">
                  <td className="border p-3">{r.label}</td>
                  <td className="border p-3">{r.hcmhn}</td>
                  <td className="border p-3">{r.ngoai}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-[13px] text-gray-500 mt-2">
          * Chính sách áp dụng từ 03/09/2025. Có thể thay đổi theo thực tế.
        </p>
      </section>

      {/* ETA table */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-3">Thời gian dự kiến giao hàng</h2>
        <p className="text-[14px] text-gray-600 mb-3">
          Thời gian dự kiến phụ thuộc vào kho xuất và địa chỉ nhận. Tham khảo
          bảng sau:
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-700">
                <th className="border p-3 text-left w-[40%]">Tuyến</th>
                <th className="border p-3 text-left">Khu vực</th>
                <th className="border p-3 text-left">Thời gian dự kiến</th>
              </tr>
            </thead>
            <tbody>
              {TIME_ROWS.map((r, idx) => (
                <tr key={idx} className="align-top hover:bg-gray-50">
                  <td className="border p-3 whitespace-pre-line">{r.route}</td>
                  <td className="border p-3">{r.area}</td>
                  <td className="border p-3">{r.eta}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ul className="mt-4 text-[13.5px] text-gray-600 list-disc pl-5 space-y-1">
          <li>
            Nội thành TP.HCM gồm các Quận: 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11,
            12, Bình Tân, Gò Vấp, Thủ Đức, Bình Thạnh, Phú Nhuận, Tân Phú, Tân
            Bình.
          </li>
          <li>
            Nội thành Hà Nội gồm các Quận: Hoàn Kiếm, Đống Đa, Ba Đình, Hai Bà
            Trưng, Hoàng Mai, Thanh Xuân, Tây Hồ, Cầu Giấy, Long Biên, Hà Đông,
            Nam Từ Liêm, Bắc Từ Liêm.
          </li>
        </ul>
      </section>

      {/* Notes */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5">
        <h2 className="font-semibold mb-3">Lưu ý</h2>
        <ul className="text-[14px] text-gray-700 list-disc pl-5 space-y-2">
          <li>
            Một số trường hợp hàng hóa không sẵn tại kho gần nhất, thời gian
            giao có thể chậm hơn dự kiến.
          </li>
          <li>
            Thời gian làm việc: Thứ 2–Thứ 6 (không tính T7, CN và ngày lễ).
            Không bao gồm các tuyến huyện đảo xa.
          </li>
          <li>
            Trước khi giao, nhân viên sẽ liên hệ xác nhận qua điện thoại. Nếu
            không thể liên lạc nhiều lần, đơn có thể được dời lịch.
          </li>
          <li>
            Quý khách vui lòng kiểm tra ngoại quan & niêm phong khi nhận hàng.
            Nếu bất thường, từ chối nhận và liên hệ hotline{" "}
            <a className="text-emerald-600 hover:underline" href="tel:19005301">
              1900.5301
            </a>{" "}
            để được hỗ trợ.
          </li>
        </ul>
      </section>
    </div>
  );
}
