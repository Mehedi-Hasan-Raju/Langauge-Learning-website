import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../../middlewares/auth.middleware";

import {
  createListeningExerciseController,
  getListeningExercisesByChapterController,
  getListeningExerciseByIdController,
  updateListeningExerciseController,
  deleteListeningExerciseController,
  createListeningTaskController,
  getListeningTaskByIdController,
  updateListeningTaskController,
  deleteListeningTaskController,
} from "../../controller/listening/listening.controller";

const router = Router();

// ==========================================
// Listening Exercise
// ==========================================

router.post(
  "/exercises",
  authenticate,
  authorizeAdmin,
  createListeningExerciseController
);

router.get(
  "/chapter/:chapterId",
  authenticate,
  getListeningExercisesByChapterController
);

router.get(
  "/exercises/:id",
  authenticate,
  getListeningExerciseByIdController
);

router.patch(
  "/exercises/:id",
  authenticate,
  authorizeAdmin,
  updateListeningExerciseController
);

router.delete(
  "/exercises/:id",
  authenticate,
  authorizeAdmin,
  deleteListeningExerciseController
);

// ==========================================
// Listening Tasks
// ==========================================

router.post(
  "/tasks",
  authenticate,
  authorizeAdmin,
  createListeningTaskController
);

router.get(
  "/tasks/:id",
  authenticate,
  getListeningTaskByIdController
);

router.patch(
  "/tasks/:id",
  authenticate,
  authorizeAdmin,
  updateListeningTaskController
);

router.delete(
  "/tasks/:id",
  authenticate,
  authorizeAdmin,
  deleteListeningTaskController
);

export default router;