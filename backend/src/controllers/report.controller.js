// backend/src/controllers/report.controller.js
import { ReportService } from "../services/report.service.js";

export async function getInventoryReport(req, res, next) {
  try {
    const data = await ReportService.getInventoryReport();
    return res.json({
      success: true,
      data,
    });
  } catch (err) {
    next(err);
  }
}
