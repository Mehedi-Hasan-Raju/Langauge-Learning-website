import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../../middlewares/auth.middleware";

import {
  createSpeakingPracticeController,
  getSpeakingPracticesByChapterController,
  getSpeakingPracticeByIdController,
  updateSpeakingPracticeController,
  deleteSpeakingPracticeController,
} from "../../controller/speaking/speaking.controller";

const router = Router();

// ==========================================
// Speaking Practice
// ==========================================

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createSpeakingPracticeController
);

router.get(
  "/chapter/:chapterId",
  authenticate,
  getSpeakingPracticesByChapterController
);

router.get(
  "/:id",
  authenticate,
  getSpeakingPracticeByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateSpeakingPracticeController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteSpeakingPracticeController
);

export default router;