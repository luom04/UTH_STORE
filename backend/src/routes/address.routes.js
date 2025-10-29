import { Router } from "express";
import passport from "passport";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";

const router = Router();
router.use(passport.authenticate("jwt", { session: false }));

router.get("/", getAddresses);
router.post("/", addAddress);
router.put("/:id", updateAddress);
router.delete("/:id", deleteAddress);
router.put("/:id/default", setDefaultAddress);

export default router;
