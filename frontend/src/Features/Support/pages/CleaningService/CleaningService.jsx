import { Link } from "react-router-dom";

export default function CleaningService() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="rounded-xl bg-white shadow-sm p-5 border border-gray-100">
        <h1 className="text-2xl font-bold">Dịch vụ vệ sinh</h1>
        <p className="text-sm text-gray-600 mt-1">
          Chương trình vệ sinh miễn phí tại cửa hàng & các gói vệ sinh có tính
          phí (áp dụng khu vực HCM).
        </p>
      </header>

      {/* Nội dung */}
      <article className="rounded-xl bg-white shadow-sm p-5 border border-gray-100 leading-relaxed text-[15px] text-gray-800">
        <h2 className="font-semibold text-lg mb-2">
          🎯 Thời gian áp dụng & Phạm vi
        </h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <span className="font-medium">Cửa hàng áp dụng:</span> Toàn bộ cửa
            hàng UTH Store.
          </li>
          <li>
            <span className="font-medium">Thời gian áp dụng:</span> Luôn mở
            (theo lịch chương trình tại từng thời điểm).
          </li>
        </ul>

        <hr className="my-5" />

        <h2 className="font-semibold text-lg mb-2">
          1) Vệ sinh miễn phí tại cửa hàng
        </h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <span className="font-medium">Sản phẩm áp dụng:</span> PC/ Laptop
            (không bao gồm PC custom đặc thù).
          </li>
        </ul>

        <div className="mt-3">
          <div className="font-medium mb-1">Danh mục vệ sinh:</div>
          <ul className="list-[square] ml-5 space-y-1">
            <li>
              PC: vệ sinh ngoại quan mặt ngoài, vệ sinh bụi, vệ sinh tra keo.
            </li>
            <li>
              Laptop: vệ sinh ngoại quan A-B-C-D, vệ sinh bụi 2 quạt tản nhiệt
              (không vệ sinh tra keo).
            </li>
          </ul>
        </div>

        <div className="mt-3">
          <div className="font-medium mb-1">Lưu ý:</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Áp dụng cho khách hàng mang máy đến trực tiếp cửa hàng UTH Store.
            </li>
            <li>
              Thời gian xử lý trong giờ làm việc; có thể hẹn lại khi cửa hàng
              đông khách.
            </li>
          </ul>
        </div>

        <hr className="my-5" />

        <h2 className="font-semibold text-lg mb-2">
          2) Thu cũ – Đổi mới VGA / CPU / Main
        </h2>
        <p>
          Dành cho khách hàng mang sản phẩm cũ đến cửa hàng để đổi sang sản phẩm
          mới. Xem chi tiết bảng giá tham khảo tại trang{" "}
          <Link to="/bang-gia-thu-cu" className="text-blue-600 hover:underline">
            Thu cũ đổi mới
          </Link>
          .
        </p>

        <hr className="my-5" />

        <h2 className="font-semibold text-lg mb-2">
          3) Vệ sinh tận nơi (có tính phí – áp dụng HCM)
        </h2>
        <ul className="list-disc ml-5 space-y-1">
          <li>
            <span className="font-medium">Sản phẩm áp dụng:</span> PC/ Ghế.
          </li>
          <li>
            Tham khảo nội dung và đặt lịch ở trang{" "}
            <Link
              to="/ho-tro-ky-thuat"
              className="text-blue-600 hover:underline"
            >
              Hỗ trợ kỹ thuật tại nhà
            </Link>
            .
          </li>
        </ul>

        <div className="mt-3">
          <div className="font-medium mb-1">Lưu ý:</div>
          <ul className="list-disc ml-5 space-y-1">
            <li>
              Dịch vụ có thể được ưu tiên cho khách hàng đặt lịch trước (thời
              gian xử lý nhanh trong 12–24h tuỳ khu vực).
            </li>
            <li>
              Phí dịch vụ/di chuyển tính theo khu vực; kỹ thuật sẽ xác nhận
              trước khi đến.
            </li>
          </ul>
        </div>

        <hr className="my-5" />

        <div className="rounded-lg bg-blue-50 border border-blue-100 p-4 text-blue-800">
          Cần hỗ trợ nhanh? Gọi tổng đài <strong>1900.5301</strong> (8:00–21:00)
          hoặc nhắn tin fanpage để được tư vấn sớm.
        </div>
      </article>
    </div>
  );
}
