import { Request, Response } from "express";

import {
  createVocabulary,
  getVocabularyByChapter,
  getVocabularyById,
  updateVocabulary,
  deleteVocabulary,
} from "../../service/vocabulary/vocabulary.service";

export const createVocabularyController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      germanWord,
      englishMeaning,
      article,
      plural,
      audioUrl,
      chapterId,
    } = req.body;

    if (!germanWord || !englishMeaning || !chapterId) {
      return res.status(400).json({
        success: false,
        message:
          "germanWord, englishMeaning and chapterId are required",
      });
    }

    const vocabulary = await createVocabulary({
      germanWord: germanWord.trim(),
      englishMeaning: englishMeaning.trim(),
      article:
        typeof article === "string"
          ? article.trim()
          : undefined,
      plural:
        typeof plural === "string"
          ? plural.trim()
          : undefined,
      audioUrl:
        typeof audioUrl === "string"
          ? audioUrl.trim()
          : undefined,
      chapterId,
    });

    return res.status(201).json({
      success: true,
      message: "Vocabulary created successfully",
      vocabulary,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create vocabulary",
    });
  }
};

export const getVocabularyByChapterController =
  async (req: Request, res: Response) => {
    try {
      const { chapterId } = req.params;

      if (typeof chapterId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid chapter ID",
        });
      }

      const vocabularies =
        await getVocabularyByChapter(chapterId);

      return res.status(200).json({
        success: true,
        vocabularies,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch vocabulary",
      });
    }
  };

export const getVocabularyByIdController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid vocabulary ID",
        });
      }

      const vocabulary =
        await getVocabularyById(id);

      return res.status(200).json({
        success: true,
        vocabulary,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Vocabulary not found",
      });
    }
  };

export const updateVocabularyController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid vocabulary ID",
        });
      }

      const {
        germanWord,
        englishMeaning,
        article,
        plural,
        audioUrl,
      } = req.body;

      const vocabulary =
        await updateVocabulary(id, {
          ...(germanWord !== undefined && {
            germanWord: germanWord.trim(),
          }),
          ...(englishMeaning !== undefined && {
            englishMeaning: englishMeaning.trim(),
          }),
          ...(article !== undefined && {
            article: article.trim(),
          }),
          ...(plural !== undefined && {
            plural: plural.trim(),
          }),
          ...(audioUrl !== undefined && {
            audioUrl: audioUrl.trim(),
          }),
        });

      return res.status(200).json({
        success: true,
        message: "Vocabulary updated successfully",
        vocabulary,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update vocabulary",
      });
    }
  };

export const deleteVocabularyController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid vocabulary ID",
        });
      }

      await deleteVocabulary(id);

      return res.status(200).json({
        success: true,
        message: "Vocabulary deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete vocabulary",
      });
    }
  };