import SidebarNav from "../../components/NavBar/SidebarNav.jsx";
import Banner from "../../components/Banner/Banner.jsx";
import ProductRow from "../../components/product/ProductRow.jsx";
import CategoriesSection from "../../components/Categories/CategoriesSection.jsx";

const mockPCs = [
  {
    id: "pc1",
    title: "PC GVN i5-12400F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    price: 13990000,
    oldPrice: 15420000,
    chips: ["i5 12400F", "B760", "16GB", "500GB", "RTX 3050"],
  },
  {
    id: "pc2",
    title: "PC GVN i3-12100F / RTX 3050",
    image:
      "https://images.unsplash.com/photo-1511452885600-a3d2c9148a31?q=80&w=800&auto=format&fit=crop",
    price: 11890000,
    oldPrice: 13530000,
    chips: ["i3 12100F", "H610", "8GB", "250GB", "RTX 3050"],
  },
  {
    id: "pc3",
    title: "PC GVN x MSI PROJECT ZERO WHITE",
    image:
      "https://images.unsplash.com/photo-1593642634367-d91a135587b5?q=80&w=800&auto=format&fit=crop",
    price: 30990000,
    oldPrice: 33020000,
    chips: ["i5 14400F", "B760", "16GB", "1TB", "RTX 4060"],
  },
  {
    id: "pc4",
    title: "PC GVN i3-12100F / RX 6500XT",
    image:
      "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=800&auto=format&fit=crop",
    price: 10490000,
    oldPrice: 11430000,
    chips: ["i3 12100F", "RX 6500XT", "8GB", "250GB"],
  },
  {
    id: "pc5",
    title: "PC GVN i5-12400F / RTX 3060",
    image:
      "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?q=80&w=800&auto=format&fit=crop",
    price: 16890000,
    oldPrice: 18620000,
    chips: ["i5 12400F", "B760", "16GB", "500GB", "RTX 3060"],
  },
  {
    id: "pc6",
    title: "PC GVN i5-13400F / RTX 4060",
    image:
      "https://images.unsplash.com/photo-1614064641938-3bbee52958a5?q=80&w=800&auto=format&fit=crop",
    price: 21990000,
    oldPrice: 23990000,
    chips: ["i5 13400F", "B760", "16GB", "500GB", "RTX 4060"],
  },
];

const mockLaptops = mockPCs.map((p, i) => ({
  ...p,
  id: "lt" + i,
  title: p.title.replace("PC GVN", "Laptop"),
}));
const mockMice = mockPCs.map((p, i) => ({
  ...p,
  id: "ms" + i,
  title: "Chuột gaming " + (i + 1),
  chips: ["Wireless", "RGB", "PAW3395"],
}));

export default function Home() {
  return (
    <>
      {/* Sidebar + Banner */}
      <section className="max-w-6xl mx-auto px-3 mt-3">
        <div className="flex gap-4 items-stretch">
          <div className="hidden lg:block w-[20%] min-w-[220px]">
            <SidebarNav />
          </div>
          <div className="flex-1">
            <Banner />
          </div>
        </div>
      </section>

      {/* Rows sản phẩm */}
      <div className="max-w-6xl mx-auto px-3 mt-6 space-y-6">
        <ProductRow
          title="PC bán chạy"
          viewAllHref="/collections/pc"
          products={mockPCs}
        />
        <ProductRow
          title="Laptop bán chạy"
          viewAllHref="/collections/laptop"
          products={mockLaptops}
        />
        <ProductRow
          title="Chuột bán chạy"
          viewAllHref="/collections/mouse"
          products={mockMice}
        />
        <CategoriesSection />
      </div>
    </>
  );
}
