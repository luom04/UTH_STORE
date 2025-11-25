import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    description: { type: String, default: "" },

    // price: Giá Gốc (hiển thị gạch ngang)
    price: { type: Number, required: true, min: 0 },
    // discountPercent: % giảm giá
    discountPercent: { type: Number, default: 0, min: 0, max: 100 },
    // priceSale: Giá Bán (khách phải trả)
    priceSale: { type: Number, min: 0 },

    stock: { type: Number, default: 0, min: 0 },
    images: { type: [String], default: [] },
    thumbnails: { type: [String], default: [] },
    category: { type: String, index: true },
    brand: { type: String, index: true },
    specs: { type: mongoose.Schema.Types.Mixed },
    status: {
      type: String,
      enum: ["active", "draft", "hidden"],
      default: "active",
      index: true,
    },
    isFeatured: { type: Boolean, default: false, index: true },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0, min: 0 },
    sold: { type: Number, default: 0, min: 0 },
    gifts: { type: [String], default: [] },
    giftProducts: {
      type: [
        {
          product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
          qty: { type: Number, default: 1, min: 1 }, // mỗi 1 sp mua tặng bao nhiêu
        },
      ],
      default: [],
    },
    // Text highlight màu đỏ (VD: "Giảm thêm 500k qua VNPAY")
    promotionText: { type: String, default: "" },
    studentDiscountAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// ===== Helpers =====
function clampPercent(pctRaw) {
  const n = Number(pctRaw ?? 0);
  if (!Number.isFinite(n)) return 0;
  return Math.max(0, Math.min(99, n));
}

// Tính xuôi: Giá gốc -> Giá bán
function calcSale(price, pct) {
  return Math.round(Number(price) * (1 - Number(pct) / 100));
}

// Tính ngược: Giá bán -> Giá gốc
function calcPriceFromSale(priceSale, pct) {
  const denom = 1 - Number(pct) / 100;
  return Math.round(Number(priceSale) / (denom || 1));
}

// Làm tròn lên hàng chục ngàn (để tạo số đẹp cho trường hợp tính ngược)
function roundUpToTenThousand(num) {
  if (!num || isNaN(num)) return 0;
  return Math.ceil(num / 10000) * 10000;
}

// ==========================================
// 🆕 LOGIC XỬ LÝ (CREATE / SAVE)
// ==========================================
ProductSchema.pre("validate", function (next) {
  // 1. Chuẩn hoá phần trăm
  const pct = clampPercent(this.discountPercent);
  this.discountPercent = pct;

  const hasPrice = typeof this.price === "number";
  const hasSale = typeof this.priceSale === "number";

  // --- LOGIC XỬ LÝ ---

  // ✅ TRƯỜNG HỢP 2: Chỉ gửi priceSale (Mặc định % = 0)
  // Hoặc TRƯỜNG HỢP: Gửi priceSale + discountPercent = 0
  if (hasSale && pct === 0) {
    // Nếu không giảm giá, Giá gốc = Giá bán
    this.price = this.priceSale;
  }

  // ✅ TRƯỜNG HỢP 1: Gửi priceSale + % (Tính ngược ra price)
  else if (hasSale && pct > 0) {
    // Nếu FE gửi FULL (cả price), ta giữ nguyên (đây là yêu cầu của bạn cho FE)
    if (hasPrice) {
      // DO NOTHING: Tin tưởng giá trị FE gửi lên (để giữ số làm tròn đẹp ở FE)
    } else {
      // Test Postman: Chỉ gửi sale + %, chưa có price -> Tự tính & Làm tròn đẹp
      const rawPrice = calcPriceFromSale(this.priceSale, pct);
      this.price = roundUpToTenThousand(rawPrice);
    }
  }

  // ✅ TRƯỜNG HỢP 3: Gửi Price + % (Tính xuôi ra priceSale)
  else if (hasPrice && !hasSale) {
    this.priceSale = calcSale(this.price, pct);
  }

  next();
});

// ==========================================
// 🆕 LOGIC XỬ LÝ (UPDATE - findOneAndUpdate)
// ==========================================
ProductSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate() || {};
  const $set = update.$set ?? update; // Lấy dữ liệu người dùng gửi lên

  // Lấy dữ liệu cũ trong DB để so sánh nếu thiếu trường
  const doc = await this.model.findOne(this.getQuery()).lean();

  // Xác định giá trị % mới (lấy từ request, nếu không có thì lấy cũ)
  const incomingPct =
    $set.discountPercent !== undefined
      ? clampPercent($set.discountPercent)
      : clampPercent(doc?.discountPercent ?? 0);

  // Xác định giá Sale mới
  const hasNewSale = $set.priceSale !== undefined;
  const incomingSale = hasNewSale ? $set.priceSale : doc?.priceSale;

  // Xác định giá Gốc mới
  const hasNewPrice = $set.price !== undefined;

  // --- LOGIC ---

  // 1. Nếu % = 0 (Dù là mới set hay cũ), Giá Gốc phải bằng Giá Sale
  if (incomingPct === 0) {
    if (hasNewSale) {
      $set.price = $set.priceSale; // Đồng bộ ngay
    } else if (hasNewPrice) {
      $set.priceSale = $set.price; // Đồng bộ ngay
    }
  }
  // 2. Nếu có % giảm giá
  else {
    // Case: Có gửi Giá Sale mới lên
    if (hasNewSale) {
      // Nếu KHÔNG gửi kèm Price -> Tính ngược (Test Postman)
      if (!hasNewPrice) {
        const rawPrice = calcPriceFromSale(incomingSale, incomingPct);
        $set.price = roundUpToTenThousand(rawPrice);
      }
      // Nếu CÓ gửi kèm Price -> Giữ nguyên (FE gửi full) -> Không làm gì cả
    }
    // Case: Chỉ gửi Giá Gốc mới, không gửi Giá Sale -> Tính xuôi
    else if (hasNewPrice && !hasNewSale) {
      $set.priceSale = calcSale($set.price, incomingPct);
    }
    // Case: Chỉ update % (giữ giá gốc cũ, tính lại giá sale)
    else if (
      $set.discountPercent !== undefined &&
      !hasNewPrice &&
      !hasNewSale
    ) {
      if (doc?.price) {
        $set.priceSale = calcSale(doc.price, incomingPct);
      }
    }
  }

  // Gán ngược lại vào update
  if (update.$set) {
    update.$set = $set;
  } else {
    update = $set;
  }
  this.setUpdate(update);
  next();
});

// Indexing
ProductSchema.index({
  category: 1,
  brand: 1,
  price: 1,
  isFeatured: 1,
  status: 1,
});

export const Product = mongoose.model("Product", ProductSchema);
