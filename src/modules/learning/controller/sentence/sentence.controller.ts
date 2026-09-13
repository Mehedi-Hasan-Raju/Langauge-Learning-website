import { Request, Response } from "express";

import {
  createSentenceExercise,
  getSentenceExercisesByChapter,
  getSentenceExerciseById,
  updateSentenceExercise,
  deleteSentenceExercise,
} from "../../service/sentence/sentence.service";

export const createSentenceExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        taskNo,
        question,
        words,
        answer,
        explanation,
        chapterId,
      } = req.body;

      if (
          taskNo === undefined ||
          !question ||
          !Array.isArray(words) ||
           words.length === 0 ||
        !answer ||
          !chapterId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "taskNo, question, words, answer and chapterId are required",
        });
      }

      const exercise =
        await createSentenceExercise({
          taskNo: Number(taskNo),
          question,
          words,
          answer,
          explanation,
          chapterId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Sentence exercise created successfully",
        exercise,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create sentence exercise",
      });
    }
  };

export const getSentenceExercisesByChapterController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { chapterId } = req.params;

      if (typeof chapterId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid chapterId",
        });
      }

      const exercises =
        await getSentenceExercisesByChapter(
          chapterId
        );

      return res.status(200).json({
        success: true,
        exercises,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch sentence exercises",
      });
    }
  };

export const getSentenceExerciseByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise id",
        });
      }

      const exercise =
        await getSentenceExerciseById(id);

      return res.status(200).json({
        success: true,
        exercise,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Sentence exercise not found",
      });
    }
  };

export const updateSentenceExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise id",
        });
      }

      const exercise =
        await updateSentenceExercise(
          id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Sentence exercise updated successfully",
        exercise,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update sentence exercise",
      });
    }
  };

export const deleteSentenceExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise id",
        });
      }

      await deleteSentenceExercise(id);

      return res.status(200).json({
        success: true,
        message:
          "Sentence exercise deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete sentence exercise",
      });
    }
  };