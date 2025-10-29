// PrivacyPolicyPage.jsx

import React from "react";
import PolicySectionCard from "../../components/PolicySectionCard"; // Nhớ import component con

const PrivacyPolicy = () => {
  return (
    <main className="min-h-screen bg-slate-100 dark:bg-slate-900 font-sans ">
      {/* --- Header --- */}
      <header className="bg-white dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
        <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900 mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.286Z"
              />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-slate-50">
            Chính Sách Bảo Mật
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
            Cam kết của chúng tôi về việc bảo vệ dữ liệu và quyền riêng tư của
            bạn.
          </p>
        </div>
      </header>

      {/* --- Nội dung chính sách --- */}
      <div className="max-w-3xl mx-auto py-12 sm:py-16 px-4 sm:px-6 space-y-8">
        <PolicySectionCard title="1. Mục đích và phạm vi thu thập thông tin">
          <p>
            Chúng tôi không bán, trao đổi hay chia sẻ dữ liệu cá nhân cho bên
            thứ ba. Thông tin được thu thập nhằm phục vụ trực tiếp cho hoạt động
            cung cấp sản phẩm và chăm sóc khách hàng.
          </p>
          <p>
            Thông tin có thể bao gồm: họ tên, địa chỉ, số điện thoại, email và
            chi tiết giao dịch.
          </p>
        </PolicySectionCard>

        <PolicySectionCard title="2. Phạm vi sử dụng thông tin">
          <ul>
            <li>Xác minh tài khoản, xử lý đơn hàng và bảo hành.</li>
            <li>Liên hệ thông báo trạng thái đơn, hóa đơn chứng từ.</li>
            <li>Cải thiện dịch vụ và cá nhân hóa trải nghiệm.</li>
            <li>Gửi thông tin khuyến mãi khi được bạn đồng ý.</li>
          </ul>
        </PolicySectionCard>

        <PolicySectionCard title="3. Thời gian lưu trữ thông tin">
          <p>
            Dữ liệu được lưu trữ trong suốt thời gian bạn là khách hàng và tối
            thiểu theo thời hạn quy định của pháp luật. Khi không còn nhu cầu,
            dữ liệu sẽ được xóa hoặc ẩn danh an toàn.
          </p>
        </PolicySectionCard>

        <PolicySectionCard title="4. Những người/tổ chức có thể được tiếp cận">
          <p>
            Chúng tôi chỉ chia sẻ dữ liệu với các bên cần thiết để cung cấp dịch
            vụ như: đơn vị vận chuyển, cổng thanh toán, đối tác bảo hành, và cơ
            quan nhà nước khi có yêu cầu hợp lệ.
          </p>
        </PolicySectionCard>

        {/* ... Bạn có thể tiếp tục thêm các PolicySectionCard khác cho các mục còn lại ... */}

        <PolicySectionCard title="10. Cập nhật chính sách">
          <p>
            Chính sách này có thể được điều chỉnh theo thay đổi của pháp luật
            hoặc dịch vụ. Bản cập nhật sẽ có hiệu lực kể từ ngày đăng tải. Các
            thay đổi quan trọng sẽ được thông báo trên website.
          </p>
        </PolicySectionCard>
      </div>
    </main>
  );
};

export default PrivacyPolicy;
