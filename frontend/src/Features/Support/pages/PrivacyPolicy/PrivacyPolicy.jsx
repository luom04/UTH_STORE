// PrivacyPolicyPage.jsx (Design màu trắng, shadow nhẹ)

import React from "react";
import PolicySectionCard from "../../components/PolicySectionCard"; // Nhớ import component con

const PrivacyPolicy = () => {
  return (
    // Thay đổi: Nền trắng hoặc xám nhạt tinh tế
    <main className="min-h-screen bg-gray-50 font-sans antialiased">
      {/* --- Header --- */}
      <header className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto py-16 px-4 sm:px-6 text-center">
          {/* Icon: Vẫn dùng màu nhấn nhưng nhẹ nhàng hơn, nền trắng */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-50 mb-4 ring-4 ring-blue-100">
            <svg
              className="w-8 h-8 text-blue-600"
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
          {/* Tiêu đề: Màu chữ đậm, dễ đọc trên nền trắng */}
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight leading-tight">
            Chính Sách Bảo Mật
          </h1>
          {/* Mô tả: Màu xám trung tính, font medium */}
          <p className="mt-4 max-w-2xl mx-auto text-lg font-medium text-gray-600">
            Cam kết của chúng tôi về việc bảo vệ dữ liệu và quyền riêng tư của
            bạn.
          </p>
          <p className="mt-2 text-sm text-gray-400">
            Cập nhật lần cuối: 14/11/2025
          </p>
        </div>
      </header>

      {/* --- Nội dung chính sách --- */}
      {/* Giảm max-w để nội dung dễ đọc hơn trên nền trắng, tăng khoảng cách giữa các card */}
      <div className="max-w-2xl mx-auto py-12 sm:py-20 px-4 sm:px-6 space-y-8">
        {/* Nội dung được giữ nguyên */}
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
          <div className="pl-6">
            <ul className="list-disc space-y-2">
              <li>Xác minh tài khoản, xử lý đơn hàng và bảo hành.</li>
              <li>Liên hệ thông báo trạng thái đơn, hóa đơn chứng từ.</li>
              <li>Cải thiện dịch vụ và cá nhân hóa trải nghiệm.</li>
              <li>Gửi thông tin khuyến mãi khi được bạn đồng ý.</li>
            </ul>
          </div>
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

        <PolicySectionCard title="5. Cam kết bảo mật thông tin cá nhân">
          <p>
            Chúng tôi cam kết bảo vệ thông tin cá nhân của bạn bằng các biện
            pháp bảo mật vật lý, điện tử và quản lý phù hợp. Dữ liệu được mã hóa
            và truy cập hạn chế.
          </p>
          <p>
            Mặc dù vậy, không có hệ thống nào là hoàn toàn bất khả xâm phạm.
            Chúng tôi khuyến nghị bạn cũng cần tự bảo vệ thông tin cá nhân của
            mình.
          </p>
        </PolicySectionCard>

        <PolicySectionCard title="6. Quyền của khách hàng đối với thông tin cá nhân">
          <div className="pl-6">
            <ul className="list-disc space-y-2">
              <li>
                Bạn có quyền truy cập, chỉnh sửa hoặc yêu cầu xóa dữ liệu của
                mình.
              </li>
              <li>
                Bạn có quyền phản đối việc xử lý dữ liệu hoặc rút lại sự đồng ý.
              </li>
              <li>
                Để thực hiện các quyền này, vui lòng liên hệ với chúng tôi qua
                email hoặc số điện thoại.
              </li>
            </ul>
          </div>
        </PolicySectionCard>

        <PolicySectionCard title="7. Cơ chế giải quyết khiếu nại">
          <p>
            Nếu bạn có bất kỳ khiếu nại hoặc thắc mắc nào về cách chúng tôi xử
            lý thông tin cá nhân của bạn, vui lòng liên hệ với bộ phận hỗ trợ
            khách hàng của chúng tôi. Chúng tôi sẽ cố gắng giải quyết vấn đề của
            bạn một cách nhanh chóng và hiệu quả.
          </p>
        </PolicySectionCard>

        <PolicySectionCard title="8. Thông tin liên hệ">
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về chính sách bảo mật này, vui lòng
            liên hệ:
          </p>
          <p className="mt-2">
            Email:{" "}
            <a
              href="mailto:support@yourcompany.com"
              className="text-blue-600 hover:underline"
            >
              support@yourcompany.com
            </a>
            <br />
            Điện thoại:{" "}
            <a
              href="tel:+84123456789"
              className="text-blue-600 hover:underline"
            >
              0123 456 789
            </a>
            <br />
            Địa chỉ: Tòa nhà XYZ, Đường ABC, Quận 1, TP.HCM
          </p>
        </PolicySectionCard>

        <PolicySectionCard title="9. Cookies và công nghệ theo dõi">
          <p>
            Chúng tôi có thể sử dụng cookies và các công nghệ theo dõi tương tự
            để cải thiện trải nghiệm duyệt web của bạn, phân tích lưu lượng truy
            cập và cá nhân hóa nội dung. Bạn có thể quản lý cài đặt cookie của
            mình thông qua trình duyệt.
          </p>
        </PolicySectionCard>

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
