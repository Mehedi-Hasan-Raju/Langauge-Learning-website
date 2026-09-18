import { Router } from "express";

import {
  audioUpload,
} from "../../../../lib/upload";

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
  submitSpeakingAnswerController,
  startSpeakingConversationController,
  sendSpeakingConversationMessageController,
  sendVoiceConversationMessageController,
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

router.post(
  "/submit",
  authenticate,
  audioUpload.single("audio"),
  submitSpeakingAnswerController
);

router.post(
  "/conversation/start",
  authenticate,
  startSpeakingConversationController
);

router.post(
  "/conversation/message",
  authenticate,
  sendSpeakingConversationMessageController
);

router.post(
  "/conversation/voice",
  authenticate,
  audioUpload.single("audio"),
  sendVoiceConversationMessageController
);
export default router;