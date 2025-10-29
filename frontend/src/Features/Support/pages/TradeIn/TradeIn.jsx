// src/features/support/pages/TradeIn.jsx
import { PhoneCall } from "lucide-react";
import TradeInTable from "../../components/TradeInTable";

/** MOCK NGAY TRONG FILE (sau thay bằng React Query) */
const COLS_VGA = ["Hãng", "Dòng sản phẩm", "Giá thu từ (nghìn)"];
const ROWS_VGA = [
  ["NVIDIA", "RTX 3050 6G", "2500 - 2800"],
  ["NVIDIA", "RTX 3060 12G", "4400 - 5200"],
  ["NVIDIA", "RTX 3070 Ti", "6800 - 7800"],
  ["NVIDIA", "RTX 4060", "5600 - 6400"],
  ["NVIDIA", "RTX 4070", "11200 - 12800"],
  ["AMD", "RX 580 4G", "250 - 450"],
];

const COLS_MB = ["Dòng sản phẩm", "Giá thu từ (nghìn)"];
const ROWS_MB = [
  ["H610", "700"],
  ["B560", "800"],
  ["B660", "950"],
  ["B760 (DDR4)", "1100"],
  ["Z690", "2000"],
  ["Z790 (DDR5)", "3000"],
];

const COLS_CPU = ["Dòng sản phẩm", "Giá thu từ (nghìn)"];
const ROWS_CPU = [
  ["Core i3 10105F", "850"],
  ["Core i5 10400F", "1550"],
  ["Core i5 11400F", "2100"],
  ["Core i5 12400F", "1650"],
  ["Core i7 12700F", "4350"],
  ["Core i5 13500", "4200"],
];

export default function TradeIn() {
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold text-gray-900">
          UTH STORE — Bảng giá & Chính sách thu cũ đổi mới
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Dịch vụ <strong>“Thu cũ đổi mới”</strong> giúp bạn nâng cấp linh
          kiện/sản phẩm dễ dàng với chi phí hợp lý. Giá bên dưới mang tính tham
          khảo; mức giá cuối cùng sẽ được xác định sau khi kỹ thuật kiểm tra
          trực tiếp tại cửa hàng.
        </p>
      </header>

      {/* Thông báo + Hotline */}
      <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-4 text-amber-800">
        <p className="font-medium">
          Lưu ý: Giá có thể thay đổi theo thị trường. Vui lòng liên hệ trực tiếp
          để báo giá chính xác nhất.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <a
            href="tel:19005301"
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 text-white hover:bg-emerald-600"
          >
            <PhoneCall size={16} /> Hotline: 1900.5301
          </a>
          <span className="text-sm text-emerald-700">
            Thời gian: 08:00 – 21:00 mỗi ngày
          </span>
        </div>
      </div>

      {/* Bảng giá tham khảo */}
      <h2 className="mt-6 text-lg font-semibold text-rose-600">
        Bảng giá thu sản phẩm cũ (tham khảo)
      </h2>

      <div className="mt-3 grid grid-cols-1 gap-5">
        <TradeInTable title="DBW – VGA" columns={COLS_VGA} rows={ROWS_VGA} />
        <TradeInTable
          title="DBW – Mainboard"
          columns={COLS_MB}
          rows={ROWS_MB}
        />
        <TradeInTable title="DBW – CPU" columns={COLS_CPU} rows={ROWS_CPU} />
      </div>

      {/* Quy trình */}
      <section className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Quy trình thu cũ đổi mới</h3>
        <ol className="list-decimal pl-5 text-gray-800 space-y-1">
          <li>
            Mang sản phẩm cũ đến cửa hàng hoặc liên hệ tổng đài để được tư vấn.
          </li>
          <li>Kỹ thuật kiểm tra tình trạng & định giá sản phẩm cũ.</li>
          <li>Báo giá thu mua và tư vấn gói nâng cấp/phù hợp nhu cầu.</li>
          <li>
            Hoàn tất thủ tục & lên đơn đổi mới (nếu khách đồng ý mức giá).
          </li>
        </ol>
      </section>

      {/* Chính sách định giá */}
      <section className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Chính sách định giá</h3>
        <ul className="list-disc pl-5 text-gray-800 space-y-1">
          <li>Khả năng hoạt động & hiệu năng thực tế.</li>
          <li>Thương hiệu, model và đời sản phẩm.</li>
          <li>Thời gian bảo hành còn lại.</li>
          <li>Tình trạng ngoại hình: trầy xước, móp méo…</li>
          <li>Phụ kiện/bao bì đi kèm (hộp, cáp, tài liệu…).</li>
        </ul>
      </section>

      {/* Không nhận thu */}
      <section className="mt-6">
        <h3 className="mb-2 text-lg font-semibold text-rose-600">
          Các sản phẩm không thu
        </h3>
        <ul className="list-disc pl-5 text-gray-800 space-y-1">
          <li>Hư hỏng nặng, cháy nổ, cong vênh, vỡ nát.</li>
          <li>Đã can thiệp sửa chữa không đúng tiêu chuẩn.</li>
          <li>Không rõ nguồn gốc/xuất xứ.</li>
        </ul>
      </section>

      {/* Liên hệ */}
      <section className="mt-6">
        <h3 className="mb-2 text-lg font-semibold">Liên hệ</h3>
        <ul className="text-gray-800 text-sm space-y-1">
          <li>
            Email:{" "}
            <a
              className="text-blue-600 hover:underline"
              href="mailto:cskh@uthstore.vn"
            >
              cskh@uthstore.vn
            </a>
          </li>
          <li className="font-medium">Miền Bắc:</li>
          <li className="ml-4">162–164 Thái Hà, Quận Đống Đa, Hà Nội.</li>
          <li className="font-medium">Miền Nam:</li>
          <li className="ml-4">82 Hoàng Hoa Thám, Tân Bình, TP.HCM.</li>
          <li className="ml-4">905 Kha Vạn Cân, TP. Thủ Đức, TP.HCM.</li>
          <li className="ml-4">1081–1083 Trần Hưng Đạo, Quận 5, TP.HCM.</li>
        </ul>
      </section>
    </>
  );
}
