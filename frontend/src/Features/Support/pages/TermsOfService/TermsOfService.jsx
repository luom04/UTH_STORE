import React from "react";

/**
 * TermsOfServicePage.jsx (pure JS)
 * - React + Tailwind CSS
 * - 3 mục: Giới thiệu, Hướng dẫn sử dụng website, Thanh toán an toàn và tiện lợi
 * - Bỏ mục lục, nền trắng, nội dung hiển thị ở trung tâm
 */

// Mảng sections không còn cần thiết cho việc render mục lục nữa,
// nhưng vẫn có thể giữ lại để quản lý nội dung nếu muốn.
// const sections = [ ... ];

function SectionHead({ no, title }) {
  return (
    <div className="mb-4 flex items-start gap-3">
      <span className="mt-1 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-red-600 text-white font-semibold">
        {no}
      </span>
      <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-gray-50 leading-snug">
        {title}
      </h2>
    </div>
  );
}

export default function TermsOfService() {
  return (
    // Thay đổi bg-gray-50 thành bg-white ở đây
    <main className="min-h-screen bg-white dark:text-gray-100">
      {/* HERO */}
      <section className="relative overflow-hidden bg-white dark:bg-gray-500 border-b dark:border-gray-800">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
            Điều khoản dịch vụ
          </h1>
          <p className="mt-3 max-w-3xl text-gray-600 dark:text-gray-300">
            Vui lòng đọc kỹ các điều khoản dưới đây trước khi sử dụng website và
            dịch vụ của chúng tôi.
          </p>
        </div>
      </section>

      {/* WRAPPER */}
      {/* Bỏ các class grid và để article chiếm toàn bộ container */}
      <section className="mx-auto max-w-6xl px-4 sm:px-6 py-10">
        {/* KHỐI NAV (TOC) ĐÃ BỊ XÓA BỎ */}

        {/* CONTENT */}
        {/* Bỏ các class col-span để article chiếm đủ không gian */}
        <article className="space-y-10">
          {/* 1. Giới thiệu */}
          <section
            id="gioi-thieu"
            className="scroll-mt-28 rounded-2xl bg-white dark:bg-gray-900/60 shadow-sm p-6 border dark:border-gray-800"
          >
            <SectionHead no={1} title="Giới thiệu" />
            <p className="leading-relaxed text-gray-700 dark:text-gray-300">
              Chào mừng quý khách hàng đến với website của chúng tôi.
            </p>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              Khi quý khách hàng truy cập vào trang web, điều đó đồng nghĩa với
              việc quý khách <strong>đồng ý với các điều khoản</strong> dưới
              đây. Trang web có quyền thay đổi, chỉnh sửa, thêm hoặc lược bỏ bất
              kỳ phần nào của Điều khoản mua bán hàng hoá này vào bất cứ lúc
              nào. Các thay đổi có hiệu lực ngay khi được đăng trên trang web mà
              không cần thông báo trước. Khi quý khách tiếp tục sử dụng trang
              web sau khi các thay đổi được đăng tải, được hiểu là quý khách{" "}
              <strong>chấp nhận</strong> những thay đổi đó.
            </p>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              Quý khách vui lòng kiểm tra thường xuyên để cập nhật những thay
              đổi mới nhất.
            </p>
          </section>

          {/* 2. Hướng dẫn sử dụng website */}
          <section
            id="huong-dan-su-dung"
            className="scroll-mt-28 rounded-2xl bg-white dark:bg-gray-900/60 shadow-sm p-6 border dark:border-gray-800"
          >
            <SectionHead no={2} title="Hướng dẫn sử dụng website" />
            <p className="text-gray-700 dark:text-gray-300">
              Khi vào website, khách hàng phải đảm bảo{" "}
              <strong>đủ 18 tuổi</strong>, hoặc truy cập dưới sự giám sát của
              cha mẹ hoặc người giám hộ hợp pháp. Khách hàng đảm bảo có đầy đủ
              hành vi dân sự để thực hiện các giao dịch mua bán hàng hóa theo
              quy định pháp luật Việt Nam.
            </p>
            <p className="mt-3 text-gray-700 dark:text-gray-300">
              Trong suốt quá trình đăng ký, quý khách đồng ý nhận email quảng
              cáo từ website. Nếu không muốn tiếp tục nhận mail, quý khách có
              thể từ chối bằng cách nhấp vào đường link ở cuối cùng trong mỗi
              email quảng cáo.
            </p>
          </section>

          {/* 3. Thanh toán an toàn và tiện lợi */}
          <section
            id="thanh-toan"
            className="scroll-mt-28 rounded-2xl bg-white dark:bg-gray-900/60 shadow-sm p-6 border dark:border-gray-800"
          >
            <SectionHead no={3} title="Thanh toán an toàn và tiện lợi" />
            <p className="text-gray-700 dark:text-gray-300">
              Người mua có thể tham khảo các phương thức thanh toán sau và lựa
              chọn áp dụng phương thức phù hợp:
            </p>
            <ol className="mt-3 space-y-2 text-gray-700 dark:text-gray-300 list-decimal list-inside">
              <li>
                <span className="font-semibold">Thanh toán trực tiếp:</span>{" "}
                <em>(người mua nhận hàng rồi thanh toán cho người bán)</em>
              </li>
              <li>
                <span className="font-semibold">Thanh toán sau (COD):</span>{" "}
                giao hàng và thu tiền tận nơi
              </li>
              <li>
                <span className="font-semibold">Thanh toán online:</span> qua
                thẻ tín dụng, chuyển khoản
              </li>
            </ol>
          </section>

          <div className="pt-2">
            <a
              href="#top"
              className="inline-flex items-center gap-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/60 px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              ↑ Lên đầu trang
            </a>
          </div>
        </article>
      </section>
    </main>
  );
}
