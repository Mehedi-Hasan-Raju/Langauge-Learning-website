import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import {
  createLevelController,
  getAllLevelsController,
  getLevelByIdController,
  updateLevelController,
  deleteLevelController,
} from "../controller/level.controller";

const router = Router();

// Public / authenticated user can view levels
router.get("/", getAllLevelsController);

router.get("/:id", getLevelByIdController);

// Admin only
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createLevelController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateLevelController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteLevelController
);

export default router;