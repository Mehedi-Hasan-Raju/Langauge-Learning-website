import { Request, Response } from "express";
import {
  createGrammarQuestion,
  getGrammarQuestionById,
  updateGrammarQuestion,
  deleteGrammarQuestion,
  submitGrammarAnswer,
} from "../service/grammar-question.service";
import { AuthRequest } from "../../../middlewares/auth.middleware";


export const createGrammarQuestionController =
  async (req: Request, res: Response) => {
    try {
      const {
        taskNo,
        question,
        type,
        answer,
        options,
        explanation,
        grammarId,
      } = req.body;

      if (
        taskNo === undefined ||
        !question ||
        !type ||
        !answer ||
        !grammarId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "taskNo, question, type, answer and grammarId are required",
        });
      }

      const grammarQuestion =
        await createGrammarQuestion({
          taskNo: Number(taskNo),
          question: question.trim(),
          type,
          answer: answer.trim(),
          options,
          explanation,
          grammarId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Grammar question created successfully",
        question: grammarQuestion,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create grammar question",
      });
    }
  };

export const getGrammarQuestionByIdController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID",
        });
      }

      const question =
        await getGrammarQuestionById(id);

      return res.status(200).json({
        success: true,
        question,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Grammar question not found",
      });
    }
  };

export const updateGrammarQuestionController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID",
        });
      }

      const question =
        await updateGrammarQuestion(id, {
          ...(req.body.taskNo !== undefined && {
            taskNo: Number(req.body.taskNo),
          }),
          ...req.body,
        });

      return res.status(200).json({
        success: true,
        message:
          "Grammar question updated successfully",
        question,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update grammar question",
      });
    }
  };

export const deleteGrammarQuestionController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid question ID",
        });
      }

      await deleteGrammarQuestion(id);

      return res.status(200).json({
        success: true,
        message:
          "Grammar question deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete grammar question",
      });
    }
  };


  export const submitGrammarAnswerController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { questionId } = req.params;
    const { answer } = req.body;

    if (typeof questionId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid question ID",
      });
    }

    if (typeof answer !== "string" || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Answer is required",
      });
    }

    const result = await submitGrammarAnswer(
      req.user.userId,
      questionId,
      answer
    );

    return res.status(200).json({
      success: true,
      message: result.correct
        ? "Correct answer"
        : "Incorrect answer",
      correct: result.correct,
      score: result.score,
      correctAnswer: result.correctAnswer,
      explanation: result.explanation,
      submissionId: result.submission.id,
      progress: result.progress,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to submit answer",
    });
  }
};

