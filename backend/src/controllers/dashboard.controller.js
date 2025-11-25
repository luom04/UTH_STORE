import { DashboardService } from "../services/dashboard.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await DashboardService.getStats();
  const chart = await DashboardService.getRevenueChart();
  res.json({ success: true, data: { ...stats, chart } });
});
