import React from "react";

/**
 * SectionHead Component: Hiển thị tiêu đề mục (số và tên)
 * Cập nhật: Thay đổi màu nhấn từ Red sang Indigo
 */
function SectionHead({ no, title }) {
  return (
    <div className="mb-6 flex items-start gap-3 border-b border-indigo-100 pb-3">
      {/* Icon/Số: Màu nền Indigo 600, kích thước lớn hơn một chút */}
      <span className="mt-1 inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white font-bold text-lg shadow-lg">
        {no}
      </span>
      {/* Tiêu đề: Font Semibold, màu chữ tối */}
      <h2 className="text-2xl font-bold text-gray-900 leading-tight">
        {title}
      </h2>
    </div>
  );
}

export default function TermsOfService() {
  return (
    // Nền trắng chủ đạo
    <main className="min-h-screen bg-gray-50 text-gray-800 antialiased">
      {/* HERO / Header */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-12">
          {/* Tiêu đề chính */}
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-gray-900 leading-tight">
            Điều khoản dịch vụ
          </h1>
          {/* Mô tả */}
          <p className="mt-3 max-w-3xl text-lg text-gray-600">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng website và
            dịch vụ của chúng tôi.
          </p>
          <p className="mt-1 text-sm text-gray-400">
            Cập nhật lần cuối: 14/11/2025
          </p>
        </div>
      </section>

      {/* WRAPPER / Nội dung chính */}
      {/* Tăng khoảng cách verticle */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 py-12 md:py-16">
        <article className="space-y-10">
          {/* 1. Giới thiệu (Card) */}
          <section
            id="gioi-thieu"
            className="scroll-mt-28 rounded-xl bg-white shadow-lg p-6 sm:p-8 border border-gray-100 transition duration-300 hover:shadow-xl"
          >
            <SectionHead no={1} title="Giới thiệu" />
            <p className="leading-relaxed text-gray-700">
              Chào mừng quý khách hàng đến với website của chúng tôi.
            </p>
            <p className="mt-3 text-gray-700">
              Khi quý khách hàng truy cập vào trang web, điều đó đồng nghĩa với
              việc quý khách{" "}
              <strong className="text-indigo-600">
                đồng ý với các điều khoản
              </strong>{" "}
              dưới đây. Trang web có quyền thay đổi, chỉnh sửa, thêm hoặc lược
              bỏ bất kỳ phần nào của Điều khoản mua bán hàng hoá này vào bất cứ
              lúc nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang
              web mà không cần thông báo trước. Khi quý khách tiếp tục sử dụng
              trang web sau khi các thay đổi được đăng tải, được hiểu là quý
              khách <strong className="text-indigo-600">chấp nhận</strong> những
              thay đổi đó.
            </p>
            <p className="mt-3 text-gray-700">
              Quý khách vui lòng kiểm tra thường xuyên để cập nhật những thay
              đổi mới nhất.
            </p>
          </section>

          {/* 2. Hướng dẫn sử dụng website (Card) */}
          <section
            id="huong-dan-su-dung"
            className="scroll-mt-28 rounded-xl bg-white shadow-lg p-6 sm:p-8 border border-gray-100 transition duration-300 hover:shadow-xl"
          >
            <SectionHead no={2} title="Hướng dẫn sử dụng website" />
            <p className="text-gray-700">
              Khi vào website, khách hàng phải đảm bảo{" "}
              <strong className="text-indigo-600">đủ 18 tuổi</strong>, hoặc truy
              cập dưới sự giám sát của cha mẹ hoặc người giám hộ hợp pháp. Khách
              hàng đảm bảo có đầy đủ hành vi dân sự để thực hiện các giao dịch
              mua bán hàng hóa theo quy định pháp luật Việt Nam.
            </p>
            <p className="mt-3 text-gray-700">
              Trong suốt quá trình đăng ký, quý khách đồng ý nhận email quảng
              cáo từ website. Nếu không muốn tiếp tục nhận mail, quý khách có
              thể từ chối bằng cách nhấp vào đường link ở cuối cùng trong mỗi
              email quảng cáo.
            </p>
          </section>

          {/* 3. Thanh toán an toàn và tiện lợi (Card) */}
          <section
            id="thanh-toan"
            className="scroll-mt-28 rounded-xl bg-white shadow-lg p-6 sm:p-8 border border-gray-100 transition duration-300 hover:shadow-xl"
          >
            <SectionHead no={3} title="Thanh toán an toàn và tiện lợi" />
            <p className="text-gray-700">
              Người mua có thể tham khảo các phương thức thanh toán sau và lựa
              chọn áp dụng phương thức phù hợp:
            </p>
            <ol className="mt-4 space-y-3 text-gray-700 list-decimal list-inside pl-4">
              <li className="pl-2">
                <span className="font-bold text-indigo-600">
                  Thanh toán trực tiếp (COD):
                </span>{" "}
                Giao hàng và thu tiền tận nơi.
              </li>
              <li className="pl-2">
                <span className="font-bold text-indigo-600">
                  Thanh toán qua chuyển khoản:
                </span>{" "}
                Chuyển khoản ngân hàng theo thông tin được cung cấp.
              </li>
              <li className="pl-2">
                <span className="font-bold text-indigo-600">
                  Thanh toán online:
                </span>{" "}
                Qua thẻ tín dụng/ghi nợ hoặc các cổng thanh toán điện tử đã được
                tích hợp.
              </li>
            </ol>
          </section>

          {/* Nút lên đầu trang */}
          <div className="pt-2 text-center">
            <a
              href="#top"
              className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-100 transition duration-150"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 18.75 7.5-7.5 7.5 7.5"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m4.5 12.75 7.5-7.5 7.5 7.5"
                />
              </svg>
              Lên đầu trang
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
