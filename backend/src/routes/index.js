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

//route admin
import orderAdminRoutes from "./order.admin.routes.js";
import staffRoutes from "./staff.routes.js";
const router = Router();
router.use("/auth", authRoutes);
router.use("/addresses", addressRoutes); // ✅ thêm
router.use("/products", productRoutes);
router.use("/categories", categoryRoutes);
router.use("/brands", brandRoutes);
router.use("/uploads", uploadRoutes);
router.use("/conversations", conversationRoutes);
router.use("/messages", messageRoutes);
router.use("/cart", cartRoutes);
router.use("/orders", orderRoutes);
router.use("/export", exportRoutes); // /api/export/*.xlsx

//admin
router.use("/admin/orders", orderAdminRoutes);
router.use("/staffs", staffRoutes);

// health check
router.get("/health", (req, res) => res.json({ status: "ok" }));
export default router;
