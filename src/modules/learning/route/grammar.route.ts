import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import {
  createGrammarTopicController,
  getGrammarTopicsByChapterController,
  getGrammarTopicByIdController,
  updateGrammarTopicController,
  deleteGrammarTopicController,
  
} from "../controller/grammar.controller";

import {
  createGrammarQuestionController,
  getGrammarQuestionByIdController,
  updateGrammarQuestionController,
  deleteGrammarQuestionController,
  submitGrammarAnswerController,
} from "../controller/grammar-question.controller";

const router = Router();
 

// Grammar Topics


// User can read
router.get(
  "/chapter/:chapterId",
  authenticate,
  getGrammarTopicsByChapterController
);

router.get(
  "/topic/:id",
  authenticate,
  getGrammarTopicByIdController
);

// Admin only
router.post(
  "/topic",
  authenticate,
  authorizeAdmin,
  createGrammarTopicController
);

router.patch(
  "/topic/:id",
  authenticate,
  authorizeAdmin,
  updateGrammarTopicController
);

router.delete(
  "/topic/:id",
  authenticate,
  authorizeAdmin,
  deleteGrammarTopicController
);


//=M=E=H=E=D=I=H=A=S=A=N=R=A=J=U=
// Grammar Questions
// =M=E=H=E=D=I=H=A=S=A=N=R=A=J=U=

// Admin only
router.post(
  "/question",
  authenticate,
  authorizeAdmin,
  createGrammarQuestionController
);

router.get(
  "/question/:id",
  authenticate,
  getGrammarQuestionByIdController
);

router.patch(
  "/question/:id",
  authenticate,
  authorizeAdmin,
  updateGrammarQuestionController
);

router.delete(
  "/question/:id",
  authenticate,
  authorizeAdmin,
  deleteGrammarQuestionController
);

//========================
//answer submit
//========================
router.post(
  "/question/:questionId/answer",
  authenticate,
  submitGrammarAnswerController
);
export default router;