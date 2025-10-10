import { Router } from "express";
import passport from "passport";
import { validate } from "../middlewares/validate.js";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  createCategorySchema,
  updateCategorySchema,
  idParam as idSchema,
} from "../validators/category.schema.js";
import {
  createCategory,
  listCategories,
  getCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";

const router = Router();

// public
router.get("/", listCategories);
router.get("/:id", validate(idSchema), getCategory);

// admin
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(createCategorySchema),
  createCategory
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(updateCategorySchema),
  updateCategory
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(idSchema),
  deleteCategory
);

export default router;
