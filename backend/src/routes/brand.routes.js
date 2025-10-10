import { Router } from "express";
import passport from "passport";
import { validate } from "../middlewares/validate.js";
import { requireRoles } from "../middlewares/auth.middleware.js";
import {
  createBrandSchema,
  updateBrandSchema,
  idParam as idSchema,
} from "../validators/brand.schema.js";
import {
  createBrand,
  listBrands,
  getBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brand.controller.js";

const router = Router();

// public
router.get("/", listBrands);
router.get("/:id", validate(idSchema), getBrand);

// admin
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(createBrandSchema),
  createBrand
);

router.put(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(updateBrandSchema),
  updateBrand
);

router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin"),
  validate(idSchema),
  deleteBrand
);

export default router;
