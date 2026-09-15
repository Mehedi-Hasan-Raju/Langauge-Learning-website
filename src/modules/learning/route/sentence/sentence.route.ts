import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../../middlewares/auth.middleware";

import {
  createSentenceExerciseController,
  getSentenceExercisesByChapterController,
  getSentenceExerciseByIdController,
  updateSentenceExerciseController,
  deleteSentenceExerciseController,
  submitSentenceAnswerController,
} from "../../controller/sentence/sentence.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createSentenceExerciseController
);

router.get(
  "/chapter/:chapterId",
  authenticate,
  getSentenceExercisesByChapterController
);

router.get(
  "/:id",
  authenticate,
  getSentenceExerciseByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateSentenceExerciseController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteSentenceExerciseController
);

router.post(
  "/submit",
  authenticate,
  submitSentenceAnswerController
);

export default router;