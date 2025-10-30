// src/middlewares/validate.js
import { ZodError } from "zod";

export const validate = (schema) => (req, res, next) => {
  try {
    // Parse & validate
    const parsed = schema.parse({
      body: req.body,
      params: req.params,
      query: req.query,
    });

    // ✅ CHỈ ghi đè body và params (query để nguyên vì là getter)
    if (parsed.body !== undefined) {
      req.body = parsed.body;
    }

    if (parsed.params !== undefined) {
      req.params = parsed.params;
    }

    // ❌ KHÔNG ghi đè req.query vì nó là read-only getter
    // req.query = parsed.query; // ← XÓA DÒNG NÀY

    next();
  } catch (err) {
    console.error("❌ Validation error:", err);

    if (err instanceof ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        details: err.errors,
      });
    }
    next(err);
  }
};
