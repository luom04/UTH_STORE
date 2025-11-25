import { Router } from "express";
import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import categoryRoutes from "./category.routes.js";
import brandRoutes from "./brand.routes.js";
import uploadRoutes from "./upload.routes.js";
import conversationRoutes from "./conversation.routes.js";
import messageRoutes from "./message.routes.js";
import cartRoutes from "./cart.routes.js";
import orderRoutes from "./order.routes.js";
import exportRoutes from "./export.routes.js";
import addressRoutes from "./address.routes.js";
import reviewRoutes from "./review.routes.js";
import reportRoutes from "./report.routes.js";
import customerRoutes from "./customer.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import bannerRoutes from "./banner.routes.js";
import couponRoutes from "./coupon.routes.js";
import chatRoutes from "./chat.route.js";
//route admin
import staffRoutes from "./staff.routes.js";

const router = Router();
router.use("/auth", authRoutes);
router.use("/addresses", addressRoutes);
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/uploads", uploadRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/reviews", reviewRoutes);
router.use("/chats", chatRoutes);

//admin
router.use("/staffs", staffRoutes);
router.use("/exports", exportRoutes); // /api/export/*.xlsx
router.use("/reports", reportRoutes);
router.use("/customers", customerRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/banners", bannerRoutes);
router.use("/coupons", couponRoutes);

// health check
router.get("/health", (req, res) => res.json({ status: "ok" }));
export default router;
