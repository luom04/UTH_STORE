// src/pages/Product/ProductDetail.jsx
import { useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Star, MapPin, ShoppingCart } from "lucide-react";
import Button from "../../components/Button/Button.jsx";
import {} from "react-router-dom";
import { useCart } from "../../components/Cart/CartContext.jsx";

const MOCK = [
  {
    id: "pc1",
    title: "PC GVN i5-12400F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    specs: [
      ["CPU", "Intel i5-12400F"],
      ["Main", "B760"],
      ["RAM", "16GB DDR4"],
      ["SSD", "500GB NVMe"],
      ["VGA", "RTX 3050"],
      ["PSU", "550W 80+"],
      ["Case", "Mid Tower"],
    ],
    description:
      "Bộ PC cân mọi tựa game eSports ở 1080p, tối ưu hiệu năng/chi phí cho học sinh - sinh viên.",
  },
  {
    id: "pc2",
    title: "PC GVN i3-12100F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=1200&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    specs: [
      ["CPU", "Intel i3-12100F"],
      ["Main", "H610"],
      ["RAM", "8GB DDR4"],
      ["SSD", "250GB NVMe"],
      ["VGA", "RTX 3050"],
      ["PSU", "500W 80+"],
      ["Case", "Mid Tower"],
    ],
    description:
      "Bộ PC entry-level cho game thủ, phù hợp với các tựa game nhẹ và công việc văn phòng.",
  },
  {
    id: "pc3",
    title: "PC GVN x MSI PROJECT ZERO WHITE",
    image:
      "https://images.unsplash.com/photo-1593642634367-d91a135587b5?q=80&w=1200&auto=format&fit=crop",
    price: 30990000,
    oldPrice: 33020000,
    specs: [
      ["CPU", "Intel i5-14400F"],
      ["Main", "B760"],
      ["RAM", "16GB DDR5"],
      ["SSD", "1TB NVMe Gen4"],
      ["VGA", "RTX 4060"],
      ["PSU", "750W 80+ Gold"],
      ["Case", "MSI Project Zero White"],
    ],
    description:
      "PC cao cấp thiết kế tối giản, dây nguồn ẩn gọn gàng, hiệu năng mạnh mẽ cho gaming và content creation.",
  },
  {
    id: "pc4",
    title: "PC GVN i3-12100F / RX 6500XT",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    price: 10490000,
    oldPrice: 11430000,
    specs: [
      ["CPU", "Intel i3-12100F"],
      ["Main", "H610"],
      ["RAM", "8GB DDR4"],
      ["SSD", "250GB NVMe"],
      ["VGA", "AMD RX 6500XT"],
      ["PSU", "500W 80+"],
      ["Case", "Mid Tower"],
    ],
    description:
      "Giải pháp tiết kiệm với card AMD, phù hợp cho game 1080p và streaming cơ bản.",
  },
  {
    id: "pc5",
    title: "PC GVN i5-12400F / RTX 3060",
    image:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=1200&auto=format&fit=crop",
    price: 16890000,
    oldPrice: 18620000,
    specs: [
      ["CPU", "Intel i5-12400F"],
      ["Main", "B760"],
      ["RAM", "16GB DDR4"],
      ["SSD", "500GB NVMe"],
      ["VGA", "RTX 3060 12GB"],
      ["PSU", "650W 80+ Bronze"],
      ["Case", "Mid Tower RGB"],
    ],
    description:
      "Cấu hình sweet spot cho gaming 1080p/1440p, đủ mạnh cho AAA games ở setting cao.",
  },
  {
    id: "pc6",
    title: "PC GVN i5-13400F / RTX 4060",
    image:
      "https://images.unsplash.com/photo-1614064641938-3bbee52958a5?q=80&w=1200&auto=format&fit=crop",
    price: 21990000,
    oldPrice: 23990000,
    specs: [
      ["CPU", "Intel i5-13400F"],
      ["Main", "B760"],
      ["RAM", "16GB DDR5"],
      ["SSD", "500GB NVMe Gen4"],
      ["VGA", "RTX 4060 8GB"],
      ["PSU", "650W 80+ Gold"],
      ["Case", "Mid Tower Mesh"],
    ],
    description:
      "PC thế hệ mới với DDR5, hỗ trợ DLSS 3.0, hiệu năng vượt trội cho gaming và render.",
  },
  // Thêm các laptop
  {
    id: "lt0",
    title: "Laptop i5-12400F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    specs: [
      ["CPU", "Intel i5-12400F"],
      ["RAM", "16GB DDR4"],
      ["Storage", "500GB SSD"],
      ["Display", "15.6 inch FHD"],
      ["VGA", "RTX 3050"],
    ],
    description:
      "Laptop gaming di động với hiệu năng ổn định cho công việc và giải trí.",
  },
  {
    id: "lt1",
    title: "Laptop i3-12100F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=1200&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    specs: [
      ["CPU", "Intel i3-12100F"],
      ["RAM", "8GB DDR4"],
      ["Storage", "250GB SSD"],
      ["Display", "15.6 inch FHD"],
      ["VGA", "RTX 3050"],
    ],
    description: "Laptop phù hợp cho sinh viên với giá cả hợp lý.",
  },
  // Thêm chuột
  {
    id: "ms0",
    title: "Chuột gaming 1",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    specs: [
      ["Cảm biến", "PAW3395"],
      ["DPI", "Up to 26000"],
      ["Kết nối", "Wireless 2.4GHz"],
      ["RGB", "16.8 triệu màu"],
      ["Pin", "70 giờ sử dụng"],
    ],
    description: "Chuột gaming cao cấp với cảm biến chính xác và pin lâu.",
  },
  {
    id: "ms1",
    title: "Chuột gaming 2",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=1200&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    specs: [
      ["Cảm biến", "PAW3370"],
      ["DPI", "Up to 20000"],
      ["Kết nối", "Wireless + USB-C"],
      ["RGB", "RGB Zone"],
      ["Trọng lượng", "65g siêu nhẹ"],
    ],
    description: "Chuột nhẹ phù hợp cho FPS gamers chuyên nghiệp.",
  },
  // Thêm bàn phím
  {
    id: "kb0",
    title: "Bàn phím gaming 1",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    specs: [
      ["Layout", "75% Hot-swap"],
      ["Switch", "Cherry MX Red"],
      ["Keycap", "PBT Double-shot"],
      ["Kết nối", "USB-C + Bluetooth"],
      ["RGB", "Per-key RGB"],
    ],
    description: "Bàn phím cơ cao cấp với khả năng tùy chỉnh switch linh hoạt.",
  },
  {
    id: "kb1",
    title: "Bàn phím gaming 2",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=1200&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    specs: [
      ["Layout", "TKL (80%)"],
      ["Switch", "Gateron Yellow"],
      ["Keycap", "ABS"],
      ["Kết nối", "USB-C"],
      ["Tính năng", "N-key rollover"],
    ],
    description:
      "Bàn phím cơ TKL gọn gàng cho bàn làm việc hạn chế không gian.",
  },
];

// ==================================================================
// THÊM MỚI: DỮ LIỆU MOCK CHO PHẦN ĐÁNH GIÁ
// ==================================================================
const REVIEWS_MOCK = [
  {
    id: 1,
    author: "Nguyễn Văn An",
    avatar: "https://ui-avatars.com/api/?name=An+Nguyen&background=random",
    date: "12/10/2025",
    rating: 5,
    content:
      "Sản phẩm tuyệt vời, đúng như mô tả. Máy chạy mượt, chiến game không giật lag. Shop tư vấn nhiệt tình, giao hàng nhanh chóng. Rất hài lòng!",
  },
  {
    id: 2,
    author: "Trần Thị Bích",
    avatar: "https://ui-avatars.com/api/?name=Bich+Tran&background=random",
    date: "10/10/2025",
    rating: 4,
    content:
      "Máy mạnh, thiết kế case đẹp. Chỉ có điều quạt tản nhiệt hơi ồn một chút khi full tải, nhưng với tầm giá này thì quá ổn rồi. Sẽ ủng hộ shop lần sau.",
  },
  {
    id: 3,
    author: "Lê Minh Cường",
    avatar: "https://ui-avatars.com/api/?name=Cuong+Le&background=random",
    date: "05/10/2025",
    rating: 5,
    content:
      "Đóng gói cẩn thận, không một vết xước. Cấu hình mạnh mẽ, render video nhanh hơn hẳn máy cũ của mình. 10/10 điểm.",
  },
];

// ==================================================================
// THÊM MỚI: DỮ LIỆU VÀ COMPONENT CHO SHOWROOM
// ==================================================================
const SHOWROOMS_MOCK = {
  HCM: [
    { address: "78-80-82 Hoàng Hoa Thám, Phường Bảy Hiến, TP.HCM" },
    { address: "905 Kha Vạn Cân, Phường Linh Tây, TP.HCM" },
    { address: "1081-1083 Trần Hưng Đạo, Phường An Đồng, TP.HCM" },
    { address: "63 Nguyễn Cửu Vân, Phường Gia Định, TP.HCM", isNew: true },
  ],
  HN: [{ address: "162-164 Thái Hà, Phường Đống Đa, Hà Nội" }],
};

function ShowroomLocations({ locations }) {
  return (
    <div className="mt-5 border-t pt-4 text-sm">
      <div className="mb-3">
        <h3 className="font-semibold underline underline-offset-2">
          Showroom HCM
        </h3>
        <ul className="mt-2 space-y-1.5 text-gray-800">
          {locations.HCM.map((loc) => (
            <li key={loc.address} className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-pink-500" />
              <span className="flex-1">
                {loc.address}
                {loc.isNew && (
                  <span className="ml-2 inline-block -rotate-12 transform text-pink-500 font-bold text-base">
                    New ✨
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold underline underline-offset-2">
          Showroom HN
        </h3>
        <ul className="mt-2 space-y-1.5 text-gray-800">
          {locations.HN.map((loc) => (
            <li key={loc.address} className="flex items-start gap-2">
              <MapPin size={16} className="mt-0.5 shrink-0 text-pink-500" />
              <span>{loc.address}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// ==================================================================
// THÊM MỚI: CÁC COMPONENT CON CHO PHẦN ĐÁNH GIÁ
// ==================================================================

// Component hiển thị các ngôi sao
function StarRating({ rating = 0, totalStars = 5 }) {
  return (
    <div className="flex items-center">
      {[...Array(totalStars)].map((_, index) => {
        const starValue = index + 1;
        return (
          <Star
            key={index}
            size={16}
            className={
              starValue <= rating ? "text-yellow-400" : "text-gray-300"
            }
            fill={starValue <= rating ? "currentColor" : "none"}
          />
        );
      })}
    </div>
  );
}

// Component hiển thị một mục đánh giá
function ReviewItem({ review }) {
  return (
    <div className="flex items-start gap-4 py-4">
      <img
        src={review.avatar}
        alt={review.author}
        className="size-10 rounded-full"
      />
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">{review.author}</p>
            <p className="text-xs text-gray-500">{review.date}</p>
          </div>
          <StarRating rating={review.rating} />
        </div>
        <p className="mt-2 text-gray-700 leading-relaxed">{review.content}</p>
      </div>
    </div>
  );
}

// Component chính cho khu vực đánh giá
function ProductReviews({ reviews = [] }) {
  if (!reviews.length) return null;

  const totalReviews = reviews.length;
  const averageRating = (
    reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
  ).toFixed(1);

  return (
    <section className="rounded-xl bg-white shadow-sm p-5">
      <h2 className="text-xl font-bold mb-4">Đánh giá từ khách hàng</h2>

      {/* Tóm tắt đánh giá */}
      <div className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 mb-4">
        <div className="text-4xl font-bold text-gray-800">{averageRating}</div>
        <div>
          <StarRating rating={Math.round(averageRating)} />
          <p className="text-sm text-gray-600">
            Dựa trên {totalReviews} đánh giá
          </p>
        </div>
      </div>

      {/* Danh sách các đánh giá */}
      <div className="divide-y">
        {reviews.map((review) => (
          <ReviewItem key={review.id} review={review} />
        ))}
      </div>

      {/* === THAY ĐỔI TẠI ĐÂY === */}
      <div className="mt-4 text-center">
        <Button variant="secondary" size="md" className="h-10">
          Xem thêm đánh giá
        </Button>
      </div>
    </section>
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  // Tìm product theo id từ URL, nếu không có thì lấy sản phẩm đầu tiên
  const product = useMemo(() => MOCK.find((p) => p.id === id) ?? MOCK[0], [id]);

  return (
    <div className="max-w-6xl mx-auto px-3 py-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ảnh lớn */}
        <div className="rounded-xl overflow-hidden bg-white shadow-sm">
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-[420px] object-cover"
          />
        </div>

        {/* Thông tin mua hàng */}
        <div className="rounded-xl bg-white shadow-sm p-5">
          <h1 className="text-2xl font-bold">{product.title}</h1>

          <div className="mt-3 flex items-baseline gap-3">
            {product.oldPrice && product.oldPrice > product.price && (
              <div className="text-gray-400 line-through">
                {product.oldPrice.toLocaleString()}đ
              </div>
            )}
            <div className="text-3xl font-bold text-red-600">
              {product.price.toLocaleString()}đ
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Button variant="primary" size="md">
              MUA NGAY
            </Button>
            <Button
              variant="secondary"
              size="md"
              startIcon={<ShoppingCart size={16} />}
              onClick={() => {
                add(product, 1); // thêm sản phẩm
                navigate("/cart"); // chuyển sang giỏ hàng
              }}
            >
              THÊM VÀO GIỎ
            </Button>
          </div>

          {/* === THAY ĐỔI TẠI ĐÂY === */}
          {/* 1. Xóa bỏ dòng <p> mô tả ngắn */}
          {/* <p className="mt-5 text-gray-700">{product.description}</p> */}

          {/* 2. Thêm component ShowroomLocations */}
          <ShowroomLocations locations={SHOWROOMS_MOCK} />
        </div>
      </div>

      {/* Thông tin sản phẩm + Cấu hình (gộp) */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 rounded-xl bg-white shadow-sm p-5">
          <h2 className="text-xl font-bold mb-3">Thông tin sản phẩm</h2>
          <p className="text-gray-700 leading-relaxed">{product.description}</p>

          <h3 className="mt-6 text-lg font-semibold">Cấu hình chi tiết</h3>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-[520px] w-full text-sm border-collapse">
              <tbody>
                {product.specs?.map(([k, v]) => (
                  <tr key={k} className="border-b">
                    <td className="py-2 pr-4 font-medium text-gray-600 w-40">
                      {k}
                    </td>
                    <td className="py-2 text-gray-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* hộp hỗ trợ/đổi trả (tùy chọn) */}
        <aside className="rounded-xl bg-white shadow-sm p-5 space-y-3">
          <div className="font-semibold">Chính sách</div>
          <ul className="text-sm text-gray-700 list-disc ml-5 space-y-1">
            <li>Đổi mới 7 ngày nếu lỗi nhà sản xuất.</li>
            <li>Bảo hành theo quy định hãng/nhà phân phối.</li>
            <li>Hỗ trợ trả góp qua thẻ tín dụng.</li>
          </ul>
        </aside>
      </div>

      {/* THÊM MỚI: GỌI COMPONENT ĐÁNH GIÁ TẠI ĐÂY */}
      <div className="mt-6">
        <ProductReviews reviews={REVIEWS_MOCK} />
      </div>
    </div>
  );
}
