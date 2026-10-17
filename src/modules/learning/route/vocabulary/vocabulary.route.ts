import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../../middlewares/auth.middleware";

import {
  createVocabularyController,
  getVocabularyByChapterController,
  getVocabularyByIdController,
  updateVocabularyController,
  deleteVocabularyController,
  createVocabularyExerciseController,
  getVocabularyExercisesByChapterController,
  getVocabularyExerciseByIdController,
  updateVocabularyExerciseController,
  deleteVocabularyExerciseController,
  submitVocabularyExerciseAnswerController,
} from "../../../learning/controller/vocabulary/vocabulary.controller";

const router = Router();

// User/Admin can read
router.get(
  "/chapter/:chapterId",
  authenticate,
  getVocabularyByChapterController
);

router.get(
  "/exercise/chapter/:chapterId",
  authenticate,
  getVocabularyExercisesByChapterController
);

router.get(
  "/exercise/:id",
  authenticate,
  getVocabularyExerciseByIdController
);

router.get(
  "/:id",
  authenticate,
  getVocabularyByIdController
);

// Admin only
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createVocabularyController
);

router.post(
  "/exercise",
  authenticate,
  authorizeAdmin,
  createVocabularyExerciseController
);

router.post(
  "/exercise/submit",
  authenticate,
  submitVocabularyExerciseAnswerController
);

router.patch(
  "/exercise/:id",
  authenticate,
  authorizeAdmin,
  updateVocabularyExerciseController
);

router.delete(
  "/exercise/:id",
  authenticate,
  authorizeAdmin,
  deleteVocabularyExerciseController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateVocabularyController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteVocabularyController
);

//=======================
// Pronunciation Route
//=======================

// router.get(
//   "/:id/pronunciation",
//   authenticate,
//   getVocabularyPronunciationController
// );

router.get(
  "/:id",
  authenticate,
  getVocabularyByIdController
);

export default router;