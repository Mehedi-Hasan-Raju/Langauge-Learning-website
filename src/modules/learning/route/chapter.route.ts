import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import {
  createChapterController,
  getChaptersByBookController,
  getChapterByIdController,
  updateChapterController,
  deleteChapterController,
} from "../controller/chapter.controller";

const router = Router();

// Public read
router.get(
  "/book/:bookId",
  getChaptersByBookController
);

router.get(
  "/:id",
  authenticate,
  getChapterByIdController
);

// Admin only
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createChapterController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateChapterController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteChapterController
);

export default router;