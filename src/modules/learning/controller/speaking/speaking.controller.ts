import { Request, Response } from "express";

import {
  AuthRequest,
} from "../../../../middlewares/auth.middleware";

import {
  createSpeakingPractice,
  getSpeakingPracticesByChapter,
  getSpeakingPracticeById,
  updateSpeakingPractice,
  deleteSpeakingPractice,
   submitSpeakingAnswer,
} from "../../service/speaking/speaking.service";

export const createSpeakingPracticeController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        title,
        instruction,
        prompt,
        type,
        chapterId,
      } = req.body;

      if (
        !title ||
        !instruction ||
        !type ||
        !chapterId
      ) {
        return res.status(400).json({
          success: false,
          message:
            "title, instruction, type and chapterId are required",
        });
      }

      const practice =
        await createSpeakingPractice({
          title,
          instruction,
          prompt,
          type,
          chapterId,
        });

      return res.status(201).json({
        success: true,
        message:
          "Speaking practice created successfully",
        practice,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create speaking practice",
      });
    }
  };

export const getSpeakingPracticesByChapterController =
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

      const practices =
        await getSpeakingPracticesByChapter(
          chapterId
        );

      return res.status(200).json({
        success: true,
        practices,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch speaking practices",
      });
    }
  };

export const getSpeakingPracticeByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid practice id",
        });
      }

      const practice =
        await getSpeakingPracticeById(id);

      return res.status(200).json({
        success: true,
        practice,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Speaking practice not found",
      });
    }
  };

export const updateSpeakingPracticeController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid practice id",
        });
      }

      const practice =
        await updateSpeakingPractice(
          id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Speaking practice updated successfully",
        practice,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update speaking practice",
      });
    }
  };

export const deleteSpeakingPracticeController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid practice id",
        });
      }

      await deleteSpeakingPractice(id);

      return res.status(200).json({
        success: true,
        message:
          "Speaking practice deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete speaking practice",
      });
    }
  };


  export const submitSpeakingAnswerController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const { practiceId } =
        req.body;

      if (!practiceId) {
        return res.status(400).json({
          success: false,
          message:
            "practiceId is required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "Audio file is required",
        });
      }

      const result =
        await submitSpeakingAnswer({
          userId: req.user.userId,
          practiceId,
          audioBuffer:
            req.file.buffer,
        });

      return res.status(200).json({
        success: true,
        message:
          "Speaking answer submitted successfully",
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit speaking answer",
      });
    }
  };