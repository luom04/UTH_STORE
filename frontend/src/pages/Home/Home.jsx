// src/pages/Home/Home.jsx
import SidebarNav from "../../components/NavBar/SidebarNav.jsx";
import Banner from "../../components/Banner/Banner.jsx";
import ProductRow from "../../components/Product/ProductRow.jsx";
import CategoriesSection from "../../components/Categories/CategoriesSection.jsx";
import { useBestSellers } from "../../hooks/useProductsPublic.js";

function RowBestSellers({ title, href, category, limit = 10 }) {
  const { data, isLoading, isError } = useBestSellers({ category, limit });
  return (
    <ProductRow
      title={title}
      viewAllHref={href}
      products={data?.list}
      loading={isLoading}
      error={isError}
    />
  );
}

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

      {/* Rows sản phẩm (dữ liệu thật) */}
      <div className="max-w-6xl mx-auto px-3 mt-6 space-y-6">
        <RowBestSellers
          title="PC bán chạy"
          href="/collections/pc"
          category="pc"
        />
        <RowBestSellers
          title="Laptop bán chạy"
          href="/collections/laptop"
          category="laptop"
        />
        <RowBestSellers
          title="Màn hình bán chạy"
          href="/collections/monitor"
          category="monitor"
        />
        <RowBestSellers
          title="Chuột bán chạy"
          href="/collections/mouse"
          category="mouse"
        />
        <RowBestSellers
          title="Bàn phím bán chạy"
          href="/collections/keyboard"
          category="keyboard"
        />
        <CategoriesSection />
      </div>
    </>
  );
}
