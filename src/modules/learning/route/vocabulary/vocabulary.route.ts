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
} from "../../../learning/controller/vocabulary/vocabulary.controller";

const router = Router();

// User/Admin can read
router.get(
  "/chapter/:chapterId",
  authenticate,
  getVocabularyByChapterController
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