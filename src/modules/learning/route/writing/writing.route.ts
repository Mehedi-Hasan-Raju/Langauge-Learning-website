import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../../middlewares/auth.middleware";

import {
  createWritingTaskController,
  getWritingTasksByChapterController,
  getWritingTaskByIdController,
  updateWritingTaskController,
  deleteWritingTaskController,
  submitWritingAnswerController,
} from "../../controller/writing/writing.controller";

const router = Router();

// ==========================================
// Writing Tasks
// ==========================================

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createWritingTaskController
);

router.get(
  "/chapter/:chapterId",
  authenticate,
  getWritingTasksByChapterController
);

router.get(
  "/:id",
  authenticate,
  getWritingTaskByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateWritingTaskController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteWritingTaskController
);

router.post(
  "/submit",
  authenticate,
  submitWritingAnswerController
);

export default router;