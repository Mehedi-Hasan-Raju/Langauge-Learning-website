import { Request, Response } from "express";

import {
  createListeningExercise,
  getListeningExercisesByChapter,
  getListeningExerciseById,
  updateListeningExercise,
  deleteListeningExercise,
  createListeningTask,
  getListeningTaskById,
  updateListeningTask,
  deleteListeningTask,
} from "../../service/listening/listening.service";

export const createListeningExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        title,
        audioUrl,
        transcript,
        chapterId,
      } = req.body;

      if (
        !title ||
        !audioUrl ||
        !chapterId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "title, audioUrl and chapterId are required",
        });
      }

      const exercise =
        await createListeningExercise({
          title,
          audioUrl,
          transcript,
          chapterId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Listening exercise created successfully",
        exercise,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create listening exercise",
      });
    }
  };