import { Link } from "react-router-dom";

const cats = [
  { name: "Laptop", slug: "laptop" },
  { name: "Chuột", slug: "mouse" },
  { name: "Bàn phím", slug: "keyboard" },
  { name: "Màn hình", slug: "monitor" },
];

export default function NavBar() {
  return (
    <div className="bg-[#e30019] text-white">
      <div className="max-w-6xl mx-auto px-3 h-11 flex items-center gap-6 overflow-x-auto">
        {cats.map((c) => (
          <Link
            key={c.slug}
            to={`/c/${c.slug}`}
            className="hover:underline whitespace-nowrap"
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
