# 🛒 UTH Store — Nền Tảng Thương Mại Điện Tử Full-Stack

> Ứng dụng web thương mại điện tử hiện đại, giàu tính năng. Hỗ trợ duyệt sản phẩm, giỏ hàng & thanh toán, thanh toán trực tuyến, chat thời gian thực và bảng quản trị toàn diện cho admin.

---

## 📋 Mục Lục

- [Tổng Quan](#tổng-quan)
- [Công Nghệ Sử Dụng](#công-nghệ-sử-dụng)
- [Cấu Trúc Dự Án](#cấu-trúc-dự-án)
- [Tính Năng](#tính-năng)
- [Hướng Dẫn Cài Đặt](#hướng-dẫn-cài-đặt)
  - [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
  - [Biến Môi Trường](#biến-môi-trường)
  - [Cài Đặt](#cài-đặt)
  - [Khởi Chạy Ứng Dụng](#khởi-chạy-ứng-dụng)
- [Tài Liệu API](#tài-liệu-api)
- [Phân Quyền Người Dùng](#phân-quyền-người-dùng)
---

## Tổng Quan

UTH Store là nền tảng thương mại điện tử full-stack với frontend được xây dựng bằng **React + Vite** và backend sử dụng **Express.js + MongoDB**. Hệ thống hỗ trợ toàn bộ vòng đời mua sắm — từ khám phá sản phẩm đến thanh toán — đồng thời cung cấp bảng quản trị phong phú cho admin và nhân viên để vận hành kinh doanh.

Điểm nổi bật:
- 🔐 Xác thực bằng JWT kết hợp Google OAuth2
- 💳 Tích hợp cổng thanh toán VNPay
- 🤖 Trợ lý chat sản phẩm bằng AI (Google Generative AI / Gemini)
- 💬 Chat hỗ trợ khách hàng thời gian thực qua Socket.IO
- 📊 Bảng quản trị với phân tích dữ liệu & xuất báo cáo
- 🎓 Hệ thống xác minh giảm giá sinh viên (CRM)
- 🏷️ Hệ thống mã giảm giá (Coupon) & khuyến mãi
- ☁️ Lưu trữ hình ảnh qua Cloudinary

---

## Công Nghệ Sử Dụng

### Frontend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| React | 19.x | Thư viện xây dựng giao diện |
| Vite (rolldown) | 7.x | Build tool |
| Tailwind CSS | 4.x | Styling |
| React Router DOM | 7.x | Điều hướng phía client |
| TanStack React Query | 5.x | Quản lý trạng thái server |
| Axios | 1.x | HTTP client |
| Socket.IO Client | 4.x | Giao tiếp thời gian thực |
| Framer Motion | 12.x | Hiệu ứng animation |
| Recharts | 3.x | Biểu đồ thống kê trong trang admin |
| Lucide React | 0.x | Thư viện icon |
| React Hot Toast | 2.x | Thông báo toast |
| Embla Carousel | 8.x | Carousel hình ảnh sản phẩm |
| yet-another-react-lightbox | 3.x | Xem ảnh phóng to (Lightbox) |
| Marked | 16.x | Render nội dung Markdown |

### Backend

| Công nghệ | Phiên bản | Mục đích |
|---|---|---|
| Node.js | ≥18 | Môi trường runtime |
| Express.js | 5.x | Web framework |
| MongoDB + Mongoose | 8.x | Cơ sở dữ liệu & ODM |
| Socket.IO | 4.x | Chat thời gian thực |
| Passport.js | 0.7 | Chiến lược xác thực |
| JWT (jsonwebtoken) | 9.x | Access token & Refresh token |
| bcryptjs | 3.x | Mã hóa mật khẩu |
| Zod | 3.x | Kiểm tra và xác thực dữ liệu đầu vào (Schema validation) |
| Cloudinary | 2.x | Lưu trữ và quản lý hình ảnh |
| Nodemailer + Resend | — | Gửi email |
| Multer | 2.x | Xử lý upload file |
| ExcelJS | 4.x | Xuất báo cáo ra file Excel |
| Helmet | 8.x | Bảo mật HTTP header |
| express-rate-limit | 8.x | Giới hạn số lượng request |
| Morgan | 1.x | Ghi log HTTP request |
| @google/generative-ai | 0.24.x | Chatbot AI (Gemini) |
| nanoid | 5.x | Tạo ID duy nhất |
| moment | 2.x | Xử lý và định dạng ngày giờ |

---

## Cấu Trúc Dự Án

```
UTH_STORE/
├── backend/
│   ├── src/
│   │   ├── app.js                  # Khởi tạo Express app
│   │   ├── index.js                # Điểm khởi động server
│   │   ├── db.js                   # Kết nối MongoDB
│   │   ├── socket.js               # Cấu hình Socket.IO
│   │   ├── config.js               # Đọc biến môi trường
│   │   ├── bootstrap/
│   │   │   └── ensureAdmin.js      # Tự động tạo tài khoản admin mặc định
│   │   ├── constants/
│   │   │   └── roles.js            # Định nghĩa vai trò (admin/staff/customer)
│   │   ├── controllers/            # Xử lý request từ route
│   │   ├── services/               # Lớp xử lý nghiệp vụ (Business logic)
│   │   ├── models/                 # Mongoose schema & model
│   │   ├── routes/                 # Định nghĩa các API route
│   │   ├── middlewares/            # Xác thực, xử lý lỗi, validation
│   │   ├── validators/             # Schema kiểm tra dữ liệu (Zod)
│   │   └── utils/                  # Hàm tiện ích (JWT, email, Cloudinary, v.v.)
│   ├── scripts/                    # Script khởi tạo dữ liệu mẫu
│   ├── package.json
│   └── vercel.json                 # Cấu hình triển khai lên Vercel
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── main.jsx
    │   ├── api/                    # Các module gọi API theo từng tài nguyên
    │   ├── components/             # Các component dùng chung
    │   │   ├── Banner/
    │   │   ├── Cart/
    │   │   ├── Chat/
    │   │   ├── Checkout/
    │   │   ├── Header/
    │   │   ├── Footer/
    │   │   ├── NavBar/
    │   │   ├── Product/
    │   │   └── Search/
    │   ├── contexts/               # React Context (AuthContext)
    │   ├── hooks/                  # Custom hook tích hợp React Query
    │   ├── pages/                  # Các trang công khai (Auth, Cart, Home, v.v.)
    │   ├── Features/
    │   │   ├── Admin/              # Bảng quản trị (dashboard, đơn hàng, nhân viên...)
    │   │   ├── Account/            # Trang cá nhân, địa chỉ, lịch sử đơn hàng
    │   │   └── Support/            # Tìm cửa hàng, bảo hành, chính sách, v.v.
    │   ├── routes/                 # Cấu hình route, route guard, đường dẫn
    │   └── utils/
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Tính Năng

### 🛍️ Dành Cho Khách Hàng

- **Trang chủ** — Banner quảng cáo, sản phẩm nổi bật, điều hướng danh mục
- **Danh mục sản phẩm** — Lọc theo danh mục, thương hiệu, giá; tìm kiếm có highlight từ khóa
- **Chi tiết sản phẩm** — Bộ sưu tập hình ảnh (lightbox), thông số kỹ thuật, đánh giá, quà tặng kèm, sản phẩm liên quan
- **Giỏ hàng** — Thêm/xóa/cập nhật số lượng, áp dụng mã giảm giá (Coupon)
- **Luồng thanh toán** — Chọn địa chỉ giao hàng, thanh toán qua VNPay, email xác nhận đơn hàng
- **Lịch sử đơn hàng** — Theo dõi đơn hàng theo trạng thái
- **Trang cá nhân** — Thông tin cá nhân, quản lý địa chỉ, đổi mật khẩu
- **Đăng nhập Google OAuth2** — Đăng nhập nhanh bằng tài khoản Google
- **Giảm giá sinh viên** — Nộp ảnh thẻ sinh viên để được xét duyệt ưu đãi
- **Chat thời gian thực** — Hỗ trợ trực tiếp qua chat (Socket.IO)
- **Chatbot AI** — Trợ lý tư vấn sản phẩm được hỗ trợ bởi Google Gemini

### 🔧 Dành Cho Admin / Nhân Viên

- **Dashboard** — Thống kê doanh thu, đơn hàng, biểu đồ trực quan (Recharts)
- **Quản lý sản phẩm** — CRUD đầy đủ với upload hình ảnh, logic tính giá giảm, quản lý tồn kho
- **Quản lý đơn hàng** — Cập nhật trạng thái đơn hàng, xem chi tiết từng đơn
- **Quản lý khách hàng (CRM)** — Ghi chú nội bộ, khóa/mở tài khoản, xét duyệt sinh viên
- **Quản lý nhân viên** — Tạo và quản lý tài khoản nhân viên kèm thông tin lương
- **Kiểm duyệt đánh giá** — Xem và xử lý đánh giá sản phẩm từ khách hàng
- **Quản lý mã giảm giá** — Tạo và quản lý các Coupon khuyến mãi
- **Quản lý Banner** — Upload và cập nhật banner hiển thị trên trang chủ
- **Quản lý Chat** — Xem toàn bộ phiên chat của khách hàng từ phía admin
- **Báo cáo & Xuất dữ liệu** — Tạo báo cáo và xuất ra file Excel (`.xlsx`)

### 🔒 Bảo Mật & Hạ Tầng

- Xoay vòng Access Token & Refresh Token (JWT lưu trong HTTP-only cookie)
- Giới hạn request (Rate limiting): 1.000 request/phút mỗi IP
- Bảo mật HTTP header với Helmet
- Kiểm tra dữ liệu đầu vào bằng Zod schema
- Hỗ trợ Idempotency cho giao dịch thanh toán (tránh xử lý trùng lặp)
- Route guard theo vai trò (Admin / Staff / Customer) ở cả frontend lẫn backend

---

## Hướng Dẫn Cài Đặt

### Yêu Cầu Hệ Thống

- **Node.js** phiên bản 18 trở lên
- **MongoDB** (cài đặt cục bộ hoặc dùng MongoDB Atlas)
- **npm** hoặc **yarn**

### Biến Môi Trường

#### Backend — `backend/.env`

```env
# Máy chủ
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Cơ sở dữ liệu
MONGODB_URI=mongodb://localhost:27017/uth_store

# JWT
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
ACCESS_TOKEN_EXPIRES=15m
REFRESH_TOKEN_EXPIRES=7d

# Cookie
COOKIE_DOMAIN=localhost

# Google OAuth2
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Gửi Email (Resend)
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=noreply@yourdomain.com

# VNPay
VNPAY_TMN_CODE=your_tmn_code
VNPAY_HASH_SECRET=your_hash_secret
VNPAY_URL=https://sandbox.vnpayment.vn/paymentv2/vpcpay.html
VNPAY_RETURN_URL=http://localhost:5173/checkout/payment-result

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Tài khoản Admin mặc định (tự động tạo khi khởi động lần đầu)
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=supersecretpassword
ADMIN_NAME=Admin
```

#### Frontend — `frontend/.env`

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Cài Đặt

```bash
# Clone repository về máy
git clone https://github.com/luom04/UTH_STORE.git
cd UTH_STORE

# Cài đặt thư viện cho backend
cd backend
npm install

# Cài đặt thư viện cho frontend
cd ../frontend
npm install
```

### Khởi Chạy Ứng Dụng

#### Môi Trường Phát Triển (Development)

```bash
# Terminal 1 — Khởi động backend (có hot reload)
cd backend
npm run dev

# Terminal 2 — Khởi động frontend
cd frontend
npm run dev
```

Frontend sẽ chạy tại **http://localhost:5173** và backend API tại **http://localhost:5000/api**.

#### Khởi Tạo Dữ Liệu Mẫu

```bash
# Chạy script seed dữ liệu sản phẩm mẫu (từ thư mục backend)
cd backend
npm run seed:products
```

> **Lưu ý:** Khi khởi động lần đầu, hệ thống sẽ tự động tạo một tài khoản **admin** mặc định dựa theo `ADMIN_EMAIL` và `ADMIN_PASSWORD` trong file `.env`.

---

## Tài Liệu API

Tất cả endpoint đều có tiền tố `/api`.

| Tài nguyên | Đường dẫn | Mô tả |
|---|---|---|
| Xác thực | `/api/auth` | Đăng ký, đăng nhập, đăng xuất, OAuth, làm mới token |
| Sản phẩm | `/api/products` | CRUD sản phẩm, tìm kiếm, lọc |
| Danh mục | `/api/categories` | Quản lý danh mục |
| Thương hiệu | `/api/brands` | Quản lý thương hiệu |
| Giỏ hàng | `/api/cart` | Các thao tác với giỏ hàng |
| Đơn hàng | `/api/orders` | Tạo và quản lý đơn hàng |
| Thanh toán | `/api/payment` | Tích hợp VNPay |
| Đánh giá | `/api/reviews` | Đánh giá sản phẩm |
| Địa chỉ | `/api/addresses` | Địa chỉ giao hàng đã lưu |
| Mã giảm giá | `/api/coupons` | Quản lý Coupon |
| Banner | `/api/banners` | Banner trang chủ |
| Chat | `/api/chats` | Quản lý phiên chat |
| Bảng quản trị | `/api/dashboard` | Thống kê cho admin |
| Khách hàng | `/api/customers` | Quản lý khách hàng (CRM) |
| Nhân viên | `/api/staffs` | Quản lý nhân viên |
| Báo cáo | `/api/reports` | Báo cáo doanh số |
| Xuất dữ liệu | `/api/exports` | Xuất dữ liệu ra file Excel |
| Upload | `/api/uploads` | Upload hình ảnh qua Cloudinary |
| Kiểm tra hệ thống | `/api/health` | Kiểm tra trạng thái server |

---

## Phân Quyền Người Dùng

| Vai trò | Quyền truy cập |
|---|---|
| `customer` | Mua sắm, giỏ hàng, thanh toán, trang cá nhân, chat |
| `staff` | Toàn bộ quyền của customer + bảng quản trị (quyền giới hạn) |
| `admin` | Toàn quyền — bao gồm cả quản lý nhân viên |

Các route được bảo vệ bằng JWT middleware ở backend và route guard (`Guards.jsx`) ở frontend.

<p align="center">Đây là dự án cá nhân của Nguyenvanluom với mục đích học tập❤️❤️❤️</p>
