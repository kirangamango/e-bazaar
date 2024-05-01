import { Router } from "express";
import { AnalyticsController } from "../controllers";
import { authenticate } from "../middlewares";

const router = Router();

router.get("/get-admin-dashboard", AnalyticsController.getAdminDashboardData);

router.get("/get-revenue", AnalyticsController.getRevenueData);

router.get("/export-all-revenue", AnalyticsController.exportAllRevenue);

router.get(
  "/export-manufacturer-revenue",
  authenticate.allUser,
  AnalyticsController.exportManfacturerRevenue
);

router.get(
  "/get-manufacturer-revenue-data",
  authenticate.allUser,
  AnalyticsController.getRevenueManfacturerData
);

router.get(
  "/get-manufacturer-dashboard",
  authenticate.allUser,
  AnalyticsController.getManufacturerDashboardData
);

router.get(
  "/distributor-dashboard-data",
  authenticate.allUser,
  AnalyticsController.distributorDashboard
);
router.get(
  "/comapny-rep-dashboard-data",
  authenticate.allUser,
  AnalyticsController.companyRepDashboard
);

export default router;
