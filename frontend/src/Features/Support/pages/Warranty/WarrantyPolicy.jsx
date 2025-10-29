// src/Features/Support/pages/WarrantyPolicy.jsx
import WarrantySearchForm from "../../components/WarrantySearchForm"; // <-- Import component mới

export default function WarrantyPolicy() {
  // --- Xóa các state và hàm onSearch ở đây ---

  const rows = [
    {
      range: "Trong 30 ngày đầu (tính từ ngày mua hàng)",
      rate: "0%",
      note: "GearVN không đề xuất sửa chữa. Chính sách thu hồi/đổi mới theo từng ngành hàng.",
    },
    {
      range: "Từ tháng thứ 02",
      rate: "2.5%",
      note: "Khấu hao theo bảng, hỗ trợ của NSX và GearVN quy định.",
    },
    { range: "Từ tháng thứ 03", rate: "5%" },
    { range: "Từ tháng thứ 04", rate: "10%" },
    { range: "Từ tháng thứ 05", rate: "20%" },
    { range: "Từ tháng thứ 06", rate: "25%" },
    { range: "Từ tháng thứ 07", rate: "35%" },
    { range: "Từ tháng thứ 08", rate: "45%" },
    { range: "Từ tháng thứ 09", rate: "55%" },
    { range: "Từ tháng thứ 10", rate: "60%" },
    { range: "Từ tháng thứ 11", rate: "65%" },
    { range: "Từ tháng thứ 12", rate: "70%" },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-xl font-bold">
          Chính sách bảo hành cho khách hàng UTH STORE
        </h1>
      </header>
      {/* Tabs + search */}
      <WarrantySearchForm /> {/* <-- Thay thế code cũ bằng component này */}
      {/* 1. Liên hệ bảo hành */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-semibold">1. Liên hệ bảo hành sản phẩm</h2>
        <p>
          Khi có nhu cầu bảo hành sản phẩm, khách hàng vui lòng liên hệ với UTH
          STORE qua các hình thức sau:
        </p>
        <ul className="list-disc pl-5 space-y-1 text-gray-700 text-sm">
          <li>
            Gọi tổng đài bảo hành{" "}
            <span className="font-semibold">1900.5325</span>.
          </li>
          <li>
            Nhắn trực tiếp tại <span className="underline">website</span> hoặc{" "}
            <span className="underline">fanpage</span>.
          </li>
          <li>
            Mang sản phẩm trực tiếp đến các chi nhánh hoặc trung tâm bảo hành
            chính hãng.
          </li>
          <li>Xem hệ thống showroom tại trang “Hệ thống cửa hàng”.</li>
        </ul>
      </section>
      {/* 2. Điều kiện bảo hành */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-semibold">2. Điều kiện bảo hành</h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>
            Sản phẩm còn thời hạn bảo hành (căn cứ hóa đơn mua hàng/serial).
          </li>
          <li>
            Sản phẩm còn tem niêm phong/tem phân phối; đầy đủ phụ kiện đi kèm
            theo quy định.
          </li>
          <li>
            Sản phẩm nguyên trạng, không trầy xước, cong vênh, biến dạng ngoài
            quy định.
          </li>
          <li>
            Không phát sinh lỗi trong quá trình sử dụng do người dùng hay tác
            động ngoài quy chuẩn kỹ thuật.
          </li>
        </ul>
        <div className="text-sm text-gray-600">
          <div className="font-medium">Lưu ý:</div>
          <ul className="list-disc pl-5 mt-1 space-y-1">
            <li>
              Dữ liệu (laptop/PC/điện thoại/ổ cứng…) là phạm vi ngoài bảo hành.
              Vui lòng tự sao lưu dữ liệu trước khi gửi máy.
            </li>
            <li>
              Chính sách có thể thay đổi theo từng nhà sản xuất/nhà phân phối —
              kiểm tra phiếu bảo hành kèm theo sản phẩm.
            </li>
          </ul>
        </div>
      </section>
      {/* 3. Không đủ điều kiện */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 space-y-3">
        <h2 className="font-semibold">
          3. Sản phẩm không đủ điều kiện bảo hành
        </h2>
        <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
          <li>Hết hạn bảo hành.</li>
          <li>
            Thiếu/không đúng tem niêm phong/serial/QR; tem rách, xóa, sửa.
          </li>
          <li>
            Hư hỏng do rơi vỡ, cong vênh, vào nước/chất lỏng, cháy nổ, chập
            điện…
          </li>
          <li>
            Tự ý can thiệp, sửa chữa/thay thế linh kiện ngoài hệ thống được ủy
            quyền.
          </li>
          <li>
            Phụ kiện tiêu hao/ngoại quan (dây, ốc, vỏ, băng dính…) hoặc hư hỏng
            do bảo quản/ vận chuyển không đúng cách.
          </li>
        </ul>
      </section>
      {/* 4. Chính sách bảo hành chung */}
      <section className="rounded-xl bg-white shadow-sm border border-gray-100 p-5 space-y-4">
        <h2 className="font-semibold">4. Chính sách bảo hành chung</h2>

        <div className="space-y-2">
          <h3 className="font-medium">4.1 Chính sách đổi mới</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>
              <span className="font-semibold">Đổi mới trong 7 ngày:</span> áp
              dụng sản phẩm lỗi phần cứng do NSX hoặc UTH STORE phát hiện. Riêng{" "}
              <span className="italic">Laptop/Màn hình</span> áp dụng theo chính
              sách riêng của ngành hàng.
            </li>
            <li>
              <span className="font-semibold">Đổi mới trong 30 ngày:</span> áp
              dụng cho gaming gear (bàn phím/chuột/tai nghe…) và linh kiện máy
              tính (NUC, CPU, RAM, ổ cứng, tản nhiệt, nguồn…).
            </li>
          </ul>
          <div className="text-sm text-gray-600">
            <div className="font-medium">Yêu cầu với sản phẩm đổi mới:</div>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>Sản phẩm còn tình trạng như lúc mới mua.</li>
              <li>Hộp/ngoại quan mới, không móp méo, rách, bẩn, viết/vẽ…</li>
              <li>
                Phụ kiện đi kèm đầy đủ, nguyên vẹn, không trầy xước hay gãy vỡ.
              </li>
            </ul>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-medium">4.2 Xử lý ngoài bảo hành</h3>
          <ul className="list-disc pl-5 space-y-1 text-sm text-gray-700">
            <li>
              Sản phẩm do lỗi người dùng: có thể từ chối bảo hành; nếu sửa chữa
              được, khách hàng thanh toán chi phí theo báo giá.
            </li>
            <li>
              Trường hợp đủ điều kiện bảo hành nhưng không còn linh kiện/phiên
              bản thay thế: sẽ áp dụng{" "}
              <span className="font-medium">khấu hao</span> theo bảng bên dưới
              để đổi sang sản phẩm tương đương (cùng nhóm/giá trị).
            </li>
          </ul>

          <div className="overflow-auto">
            <table className="min-w-[720px] w-full text-sm border border-gray-200">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="p-2 border">Thời gian sử dụng</th>
                  <th className="p-2 border">Khấu hao</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr
                    key={i}
                    className="odd:bg-white even:bg-gray-50 text-gray-800"
                  >
                    <td className="p-2 border">{r.range}</td>
                    <td className="p-2 border">{r.rate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="text-sm text-gray-600">
            * Khách hàng nhận lại sản phẩm không bảo hành nếu không đồng ý các
            phương án xử lý khác.
          </p>
        </div>

        <div className="text-center text-xs text-gray-500">
          Chính sách bảo hành có thể được cập nhật định kỳ.
        </div>
      </section>
    </div>
  );
}
