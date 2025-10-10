import {
  Phone,
  Mail,
  Facebook,
  Youtube,
  MessageCircle,
  UserRound,
  Music4, // Zalo ~ MessageCircle, TikTok ~ Music4
} from "lucide-react";

const col1 = [
  { label: "Giới thiệu", to: "/about" },
  { label: "Tuyển dụng", to: "/careers" },
  { label: "Liên hệ", to: "/contact" },
];
const col2 = [
  { label: "Chính sách bảo hành", to: "/policy/warranty" },
  { label: "Chính sách giao hàng", to: "/policy/shipping" },
  { label: "Chính sách bảo mật", to: "/policy/privacy" },
];
const col3 = [
  { label: "Hệ thống cửa hàng", to: "/stores" },
  { label: "Hướng dẫn mua hàng", to: "/guide/buying" },
  { label: "Hướng dẫn thanh toán", to: "/guide/payment" },
  { label: "Hướng dẫn trả góp", to: "/guide/installment" },
  { label: "Tra cứu địa chỉ bảo hành", to: "/guide/warranty-locations" },
  { label: "Build PC", to: "/build-pc" },
];

export default function Footer() {
  return (
    <footer className="border-t mt-10 bg-white">
      <div className="max-w-6xl mx-auto px-3 py-10">
        {/* Top grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* 4 cột link */}
          <div className="md:col-span-8 grid sm:grid-cols-2 md:grid-cols-4 gap-8">
            <FooterCol title="VỀ UTH STORE" items={col1} />
            <FooterCol title="CHÍNH SÁCH" items={col2} />
            <FooterCol title="THÔNG TIN" items={col3} />
            <SupportCol />
          </div>

          {/* Đơn vị vận chuyển + Thanh toán */}
          <div className="md:col-span-4 space-y-6">
            <LogoGroup
              title="ĐƠN VỊ VẬN CHUYỂN"
              logos={[
                "https://dummyimage.com/80x28/eee/222&text=GHN",
                "https://dummyimage.com/80x28/eee/222&text=EMS",
                "https://dummyimage.com/80x28/eee/222&text=GVN",
                "https://dummyimage.com/80x28/eee/222&text=VNPost",
              ]}
            />
            <LogoGroup
              title="CÁCH THỨC THANH TOÁN"
              logos={[
                "https://dummyimage.com/46x28/eee/222&text=IB",
                "https://dummyimage.com/46x28/eee/222&text=JCB",
                "https://dummyimage.com/46x28/eee/222&text=MC",
                "https://dummyimage.com/46x28/eee/222&text=ZaloPay",
                "https://dummyimage.com/46x28/eee/222&text=Cash",
                "https://dummyimage.com/46x28/eee/222&text=0%",
                "https://dummyimage.com/46x28/eee/222&text=VISA",
                "https://dummyimage.com/46x28/eee/222&text=MoMo",
              ]}
              size="h-7"
            />
          </div>
        </div>

        {/* line */}
        <div className="border-t my-8" />

        {/* Social + badge */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-sm font-semibold mb-3">
              KẾT NỐI VỚI CHÚNG TÔI
            </div>
            <div className="flex items-center gap-3">
              <Social icon={<Facebook size={18} />} label="Facebook" href="#" />
              <Social icon={<Music4 size={18} />} label="TikTok" href="#" />
              <Social icon={<Youtube size={18} />} label="YouTube" href="#" />
              <Social
                icon={<MessageCircle size={18} />}
                label="Zalo"
                href="#"
              />
              <Social
                icon={<UserRound size={18} />}
                label="Cộng đồng"
                href="#"
              />
            </div>
          </div>

          <a
            href="#"
            className="inline-flex items-center gap-3 border rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
          >
            <img
              src="https://dummyimage.com/28x28/e6f7ff/007bff&text=✓"
              alt=""
              className="w-7 h-7 rounded"
            />
            <span>ĐÃ THÔNG BÁO BỘ CÔNG THƯƠNG</span>
          </a>
        </div>

        {/* bottom note */}
        <div className="mt-8 text-xs text-gray-500">
          © {new Date().getFullYear()} UTH Store — inspired by GEARVN. All
          rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-3">{title}</div>
      <ul className="space-y-2">
        {items.map((it) => (
          <li key={it.label}>
            <a
              href={it.to}
              className="text-sm text-gray-700 hover:text-[#e30019]"
            >
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SupportCol() {
  return (
    <div>
      <div className="text-sm font-semibold mb-3">
        TỔNG ĐÀI HỖ TRỢ <span className="text-gray-500">(8:00 - 21:00)</span>
      </div>
      <ul className="space-y-2 text-sm">
        <li className="flex items-center gap-2">
          <Phone size={16} className="text-[#e30019]" />
          <span>Mua hàng:&nbsp;</span>
          <a href="tel:19005301" className="font-semibold text-[#0d67ff]">
            1900.5301
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Phone size={16} className="text-[#e30019]" />
          <span>Bảo hành:&nbsp;</span>
          <a href="tel:19005325" className="font-semibold text-[#0d67ff]">
            1900.5325
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Phone size={16} className="text-[#e30019]" />
          <span>Khiếu nại:&nbsp;</span>
          <a href="tel:18006173" className="font-semibold text-[#0d67ff]">
            1800.6173
          </a>
        </li>
        <li className="flex items-center gap-2">
          <Mail size={16} className="text-[#e30019]" />
          <span>Email:&nbsp;</span>
          <a
            href="mailto:cskh@uthstore.com"
            className="font-semibold text-[#0d67ff]"
          >
            cskh@uthstore.com
          </a>
        </li>
      </ul>
    </div>
  );
}

function LogoGroup({ title, logos = [], size = "h-6" }) {
  return (
    <div>
      <div className="text-sm font-semibold mb-3">{title}</div>
      <div className="flex flex-wrap items-center gap-3">
        {logos.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className={`${size} w-auto rounded bg-white`}
          />
        ))}
      </div>
    </div>
  );
}

function Social({ icon, label, href }) {
  return (
    <a
      href={href}
      aria-label={label}
      className="w-9 h-9 rounded-full bg-gray-200 hover:bg-gray-300 grid place-items-center transition"
      title={label}
    >
      {icon}
    </a>
  );
}
