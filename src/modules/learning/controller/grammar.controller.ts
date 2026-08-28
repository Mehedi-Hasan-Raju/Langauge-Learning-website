import { Request, Response } from "express";
import {
  createGrammarTopic,
  getGrammarTopicsByChapter,
  getGrammarTopicById,
  updateGrammarTopic,
  deleteGrammarTopic,
} from "../service/grammar.service";

export const createGrammarTopicController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      explanation,
      examples,
      rules,
      commonMistakes,
      videoUrl,
      chapterId,
    } = req.body;

    if (!title || !explanation || !chapterId) {
      return res.status(400).json({
        success: false,
        message:
          "title, explanation and chapterId are required",
      });
    }

    const topic = await createGrammarTopic({
      title: title.trim(),
      explanation: explanation.trim(),
      examples,
      rules,
      commonMistakes,
      videoUrl,
      chapterId,
    });

    return res.status(201).json({
      success: true,
      message: "Grammar topic created successfully",
      topic,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create grammar topic",
    });
  }
};

export const getGrammarTopicsByChapterController =
  async (req: Request, res: Response) => {
    try {
      const { chapterId } = req.params;

      if (typeof chapterId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid chapter ID",
        });
      }

      const topics =
        await getGrammarTopicsByChapter(chapterId);

      return res.status(200).json({
        success: true,
        topics,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch grammar topics",
      });
    }
  };

export const getGrammarTopicByIdController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid grammar topic ID",
        });
      }

      const topic = await getGrammarTopicById(id);

      return res.status(200).json({
        success: true,
        topic,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Grammar topic not found",
      });
    }
  };

export const updateGrammarTopicController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid grammar topic ID",
        });
      }

      const topic = await updateGrammarTopic(id, req.body);

      return res.status(200).json({
        success: true,
        message: "Grammar topic updated successfully",
        topic,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update grammar topic",
      });
    }
  };

export const deleteGrammarTopicController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid grammar topic ID",
        });
      }

      await deleteGrammarTopic(id);

      return res.status(200).json({
        success: true,
        message: "Grammar topic deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete grammar topic",
      });
    }
  };