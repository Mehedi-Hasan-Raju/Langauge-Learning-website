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
  startSpeakingConversation,
  sendSpeakingConversationMessage,
  sendVoiceConversationMessage,
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
          mimeType:
            req.file.mimetype,
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


export const startSpeakingConversationController =
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

      const result =
        await startSpeakingConversation({
          userId: req.user.userId,
          practiceId,
        });

      return res.status(201).json({
        success: true,
        ...result,
        message: "Speaking conversation started successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to start speaking conversation",
      });
    }
  };

  export const sendSpeakingConversationMessageController =
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

      const {
        conversationId,
        message,
      } = req.body;

      if (
        !conversationId ||
        message === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId and message are required",
        });
      }

      const result =
        await sendSpeakingConversationMessage({
          userId: req.user.userId,
          conversationId,
          userMessage: String(message),
        });

      return res.status(200).json({
        success: true,
        message:
          "Conversation message sent successfully",
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to send conversation message",
      });
    }
  };


export const sendVoiceConversationMessageController =
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

      const {
        conversationId,
      } = req.body;

      if (!conversationId) {
        return res.status(400).json({
          success: false,
          message:
            "conversationId is required",
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
        await sendVoiceConversationMessage({
          userId: req.user.userId,

          conversationId,

          audioBuffer:
            req.file.buffer,

          mimeType:
            req.file.mimetype,
        });

      return res.status(200).json({
        success: true,
        message:
          "Voice conversation message processed successfully",
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to process voice conversation",
      });
    }
  };