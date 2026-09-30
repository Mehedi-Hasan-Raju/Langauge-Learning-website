import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../../middlewares/auth.middleware";

import {
  getAdminDashboardController,
} from "../controller/admin-dashboard.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  authorizeAdmin,
  getAdminDashboardController
);

export default router;