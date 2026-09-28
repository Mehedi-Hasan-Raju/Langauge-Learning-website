import { Router } from "express";

import {
  authenticate,
} from "../../../middlewares/auth.middleware";

import {
  getMySubscriptionController,
  getMySubscriptionStatusController,
  cancelSubscriptionController,
} from "../controller/subscription.controller";

const router = Router();

router.get(
  "/me",
  authenticate,
  getMySubscriptionController
);

router.get(
  "/status",
  authenticate,
  getMySubscriptionStatusController
);

router.patch(
  "/:id/cancel",
  authenticate,
  cancelSubscriptionController
);

export default router;