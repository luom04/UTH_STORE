import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  getCustomers,
  updateCustomer,
  toggleBlockCustomer,
  deleteCustomer,
  getCustomerStats,
  getCustomerOrders,
  getCustomerDetails,
  addCustomerNote,
} from "../controllers/customer.controller.js";

const router = Router();

// Áp dụng authen cho tất cả routes
router.use(passport.authenticate("jwt", { session: false }));
router.use(requireRoles("admin", "staff")); // Cả admin và staff đều xem được

// Thống kê (đặt trước /:id)
router.get("/stats", getCustomerStats);
router.get("/:id/details", getCustomerDetails); // Lấy info + notes
router.post("/:id/notes", addCustomerNote); // Thêm note

// Orders
router.get("/:id/orders", getCustomerOrders);

// CRUD
router.get("/", getCustomers);
router.put("/:id", requireRoles("admin"), updateCustomer); // Chỉ admin sửa
router.patch("/:id/block", requireRoles("admin"), toggleBlockCustomer); // Chỉ admin block
router.delete("/:id", requireRoles("admin"), deleteCustomer); // Chỉ admin xóa

export default router;
