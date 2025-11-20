import { Router } from "express";
import {
    expensePieChartBreakdownController,
  chartAnalyticsController,
  summaryAnalyticsController,
} from "../controllers/analytics.controller";

const analyticsRoutes = Router();

analyticsRoutes.get("/summary", summaryAnalyticsController);
analyticsRoutes.get("/chart", chartAnalyticsController);
analyticsRoutes.get("/expense-breakdown", expensePieChartBreakdownController);

export default analyticsRoutes;
