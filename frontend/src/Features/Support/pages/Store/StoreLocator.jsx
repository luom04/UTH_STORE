// src/pages/Stores/StoreLocator.jsx
import StoreCard from "../../components/StoreCard.jsx";
import { PhoneCall } from "lucide-react";

// Mock stores giữ nguyên
const SECTIONS = [
  {
    title: "CỬA HÀNG TẠI TP. HỒ CHÍ MINH",
    city: "TP.HCM",
    stores: [
      {
        name: "TÂN BÌNH - HOÀNG HOA THÁM",
        address: "78-80-82 Hoàng Hoa Thám, Phường Bảy Hiền",
        hours: "8:00 - 21:00",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=78-80-82+Hoang+Hoa+Tham+Tan+Binh",
      },
      {
        name: "TP THỦ ĐỨC - KHA VẠN CÂN",
        address: "905 Phường Linh Tây",
        hours: "8:00 - 21:00",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=905+Kha+Van+Can+Thu+Duc",
      },
      {
        name: "BÌNH THẠNH - NGUYỄN CỬU VÂN",
        address: "63 Nguyễn Cửu Vân, Phường Gia Định",
        hours: "8:00 - 21:00",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=63+Nguyen+Cuu+Van+Binh+Thanh",
      },
      {
        name: "QUẬN 5 - TRẦN HƯNG ĐẠO",
        address: "1081-1083 Trần Hưng Đạo, Phường An Dương",
        hours: "8:00 - 21:00",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=1081+Tran+Hung+Dao+Quan+5",
      },
    ],
  },
  {
    title: "CỬA HÀNG TẠI HÀ NỘI",
    city: "Hà Nội",
    stores: [
      {
        name: "ĐỐNG ĐA - THÁI HÀ",
        address: "162-164 Thái Hà, Phường Đống Đa",
        hours: "8:00 - 21:00",
        mapUrl:
          "https://www.google.com/maps/search/?api=1&query=162-164+Thai+Ha+Dong+Da",
      },
    ],
  },
];

export default function StoreLocator() {
  // ❗️Không bọc thêm container/grid ở đây — SupportLayout đã làm rồi
  return (
    <>
      <h3 className="text-xl font-bold mb-3">Hệ Thống cửa hàng UTH STORE</h3>

      {/* Giờ mở cửa */}
      <div className="mb-4 rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        <span className="mr-2">↪</span>
        <span className="font-medium">Giờ mở cửa:</span>{" "}
        <span className="font-semibold">08:00 - 21:00</span>
      </div>

      {/* Gọi ngay */}
      <div className="mb-6 flex justify-center">
        <a
          href="tel:19005301"
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-white shadow hover:bg-emerald-600"
        >
          <PhoneCall size={18} />
          GỌI NGAY: 1900.5301
        </a>
      </div>

      {/* Các khu vực */}
      {SECTIONS.map((sec) => (
        <div key={sec.title} className="mb-8">
          <div className="mb-4 rounded-xl bg-gray-900 px-4 py-3 text-center text-white">
            <h2 className="text-lg font-semibold">{sec.title}</h2>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {sec.stores.map((s) => (
              <StoreCard
                key={s.name}
                name={s.name}
                address={s.address}
                city={sec.city}
                hours={s.hours}
                mapUrl={s.mapUrl}
                className={sec.stores.length === 1 ? "md:col-span-2" : ""}
              />
            ))}
          </div>
        </div>
      ))}
    </>
  );
}
