import { asyncHandler } from "../utils/asyncHandler.js";
import { buildWorkbook } from "../utils/excel.js";
import { Product } from "../models/product.model.js";
import { Category } from "../models/category.model.js";
import { Brand } from "../models/brand.model.js";
import { Order } from "../models/order.model.js";

function setDownloadHeaders(res, filename) {
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
}

export const exportProducts = asyncHandler(async (req, res) => {
  const docs = await Product.find().lean();
  const columns = [
    { header: "Title", key: "title" },
    { header: "Slug", key: "slug" },
    { header: "Price", key: "price" },
    { header: "PriceSale", key: "priceSale" },
    { header: "Stock", key: "stock" },
    { header: "Category", key: "category" },
    { header: "Brand", key: "brand" },
    { header: "Status", key: "status" },
    { header: "Featured", key: "isFeatured" },
    { header: "CreatedAt", key: "createdAt" },
  ];
  const rows = docs.map((d) => ({
    title: d.title,
    slug: d.slug,
    price: d.price ?? "",
    priceSale: d.priceSale ?? "",
    stock: d.stock ?? 0,
    category: d.category ?? "",
    brand: d.brand ?? "",
    status: d.status,
    isFeatured: d.isFeatured ? "yes" : "no",
    createdAt: new Date(d.createdAt).toISOString(),
  }));
  const wb = await buildWorkbook({ sheetName: "Products", columns, rows });
  setDownloadHeaders(res, "products.xlsx");
  await wb.xlsx.write(res);
  res.end();
});

export const exportCategories = asyncHandler(async (req, res) => {
  const docs = await Category.find().lean();
  const columns = [
    { header: "Name", key: "name" },
    { header: "Slug", key: "slug" },
    { header: "Status", key: "status" },
    { header: "Order", key: "order" },
  ];
  const rows = docs.map((d) => ({
    name: d.name,
    slug: d.slug,
    status: d.status,
    order: d.order ?? 0,
  }));
  const wb = await buildWorkbook({ sheetName: "Categories", columns, rows });
  setDownloadHeaders(res, "categories.xlsx");
  await wb.xlsx.write(res);
  res.end();
});

export const exportBrands = asyncHandler(async (req, res) => {
  const docs = await Brand.find().lean();
  const columns = [
    { header: "Name", key: "name" },
    { header: "Slug", key: "slug" },
    { header: "Status", key: "status" },
  ];
  const rows = docs.map((d) => ({
    name: d.name,
    slug: d.slug,
    status: d.status,
  }));
  const wb = await buildWorkbook({ sheetName: "Brands", columns, rows });
  setDownloadHeaders(res, "brands.xlsx");
  await wb.xlsx.write(res);
  res.end();
});

export const exportOrders = asyncHandler(async (req, res) => {
  const docs = await Order.find().lean();
  const columns = [
    { header: "OrderNumber", key: "orderNumber" },
    { header: "User", key: "user" },
    { header: "ItemsTotal", key: "itemsTotal" },
    { header: "Shipping", key: "shippingFee" },
    { header: "Discount", key: "discount" },
    { header: "GrandTotal", key: "grandTotal" },
    { header: "PaymentStatus", key: "paymentStatus" },
    { header: "Status", key: "status" },
    { header: "CreatedAt", key: "createdAt" },
  ];
  const rows = docs.map((d) => ({
    orderNumber: d.orderNumber || d._id.toString(),
    user: d.user?.toString() || "",
    itemsTotal: d.itemsTotal,
    shippingFee: d.shippingFee,
    discount: d.discount,
    grandTotal: d.grandTotal,
    paymentStatus: d.paymentStatus,
    status: d.status,
    createdAt: new Date(d.createdAt).toISOString(),
  }));
  const wb = await buildWorkbook({ sheetName: "Orders", columns, rows });
  setDownloadHeaders(res, "orders.xlsx");
  await wb.xlsx.write(res);
  res.end();
});
