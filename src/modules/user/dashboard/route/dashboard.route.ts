import { Router } from "express";

import {
  authenticate,
} from "../../../../middlewares/auth.middleware";

import {
  getUserDashboardController,
} from "../controller/dashboard.controller";

const router = Router();

router.get(
  "/",
  authenticate,
  getUserDashboardController
);

export default router;