// src/routes/upload.routes.js
import { Router } from "express";
import passport from "passport";
import { requireRoles } from "../middlewares/auth.middleware.js";
import crypto from "crypto";
import { config } from "../config.js";

const router = Router();

/**
 * POST /api/v1/uploads/sign-image
 * Trả về { timestamp, signature, apiKey, cloudName, folder? }
 * YÊU CẦU: admin hoặc staff
 */
router.post(
  "/sign-image",
  passport.authenticate("jwt", { session: false }),
  requireRoles("admin", "staff"),
  (req, res) => {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "uth_store/products"; // tuỳ chỉnh
    // Signature theo Cloudinary spec: sha1("folder=...&timestamp=...API_SECRET")
    const toSign = `folder=${folder}&timestamp=${timestamp}${config.cloudinary.apiSecret}`;
    const signature = crypto.createHash("sha1").update(toSign).digest("hex");

    res.json({
      success: true,
      data: {
        timestamp,
        signature,
        apiKey: config.cloudinary.apiKey,
        cloudName: config.cloudinary.cloudName,
        folder,
      },
    });
  }
);

export default router;
