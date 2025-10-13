import { Link } from "react-router-dom";

const FALLBACK_CATS = [
  {
    name: "Laptop",
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=300&auto=format&fit=crop",
    slug: "laptop",
  },
  {
    name: "PC",
    img: "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=300&auto=format&fit=crop",
    slug: "pc",
  },
  {
    name: "Màn hình",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop",
    slug: "monitor",
  },
  {
    name: "Mainboard",
    img: "https://images.unsplash.com/photo-1587202372775-98927b585b60?q=80&w=300&auto=format&fit=crop",
    slug: "mainboard",
  },
  {
    name: "CPU",
    img: "https://images.unsplash.com/photo-1614064641938-3bbee52958a5?q=80&w=300&auto=format&fit=crop",
    slug: "cpu",
  },
  {
    name: "VGA",
    img: "https://images.unsplash.com/photo-1618681662375-2b4b9fee1b7e?q=80&w=300&auto=format&fit=crop",
    slug: "vga",
  },
  {
    name: "RAM",
    img: "https://images.unsplash.com/photo-1587202372766-1f99bb68f21f?q=80&w=300&auto=format&fit=crop",
    slug: "ram",
  },
  {
    name: "Ổ cứng",
    img: "https://images.unsplash.com/photo-1614064641938-3bbee52958a5?q=80&w=300&auto=format&fit=crop",
    slug: "storage",
  },
  {
    name: "Case",
    img: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=300&auto=format&fit=crop",
    slug: "case",
  },
  {
    name: "Tản nhiệt",
    img: "https://images.unsplash.com/photo-1587202373009-c1c1b1f0b6f3?q=80&w=300&auto=format&fit=crop",
    slug: "cooling",
  },
  {
    name: "Bàn phím",
    img: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?q=80&w=300&auto=format&fit=crop",
    slug: "keyboard",
  },
  {
    name: "Chuột",
    img: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e1a?q=80&w=300&auto=format&fit=crop",
    slug: "mouse",
  },
  {
    name: "Tai nghe",
    img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=300&auto=format&fit=crop",
    slug: "headset",
  },
  {
    name: "Loa",
    img: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?q=80&w=300&auto=format&fit=crop",
    slug: "speaker",
  },
  {
    name: "Console",
    img: "https://images.unsplash.com/photo-1606813907291-76a5c4a3b0f8?q=80&w=300&auto=format&fit=crop",
    slug: "console",
  },
  {
    name: "Phụ kiện",
    img: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=300&auto=format&fit=crop",
    slug: "accessory",
  },
];

export default function CategoriesSection({
  title = "Danh mục sản phẩm",
  categories = FALLBACK_CATS, // fallback nếu chưa có API
}) {
  return (
    <section className="rounded-xl bg-white shadow-sm">
      <div className="border-b px-4 py-3">
        <h2 className="text-lg font-bold">{title}</h2>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6 p-6">
        {categories.map((c) => (
          <Link
            key={c.slug}
            to={`/collections/${c.slug}`}
            className="group flex flex-col items-center text-center"
          >
            <div className="relative h-20 w-20 overflow-hidden rounded-xl bg-gray-50 shadow-sm group-hover:shadow transition">
              <img
                src={c.img}
                alt={c.name}
                className="absolute inset-0 h-full w-full object-cover"
              />
            </div>
            <div className="mt-3 text-sm font-medium text-gray-800 group-hover:text-black">
              {c.name}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
