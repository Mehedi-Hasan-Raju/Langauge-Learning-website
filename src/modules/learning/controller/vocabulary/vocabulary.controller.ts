import { Request, Response } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

import {
  createVocabulary,
  getVocabularyByChapter,
  getVocabularyById,
  updateVocabulary,
  deleteVocabulary,
  createVocabularyExercise,
  getVocabularyExercisesByChapter,
  getVocabularyExerciseById,
  updateVocabularyExercise,
  deleteVocabularyExercise,
  submitVocabularyExerciseAnswer,
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

      chapterId: chapterId.trim(),
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

const vocabularyExerciseTypes = [
  "GERMAN_TO_ENGLISH",
  "ENGLISH_TO_GERMAN",
  "MULTIPLE_CHOICE",
] as const;

const isVocabularyExerciseType = (
  value: unknown
): value is (typeof vocabularyExerciseTypes)[number] =>
  value === "GERMAN_TO_ENGLISH" ||
  value === "ENGLISH_TO_GERMAN" ||
  value === "MULTIPLE_CHOICE";

export const createVocabularyExerciseController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      question,
      type,
      answer,
      options,
      explanation,
      chapterId,
    } = req.body;

    if (
      typeof question !== "string" ||
      !question.trim() ||
      !isVocabularyExerciseType(type) ||
      typeof answer !== "string" ||
      !answer.trim() ||
      typeof chapterId !== "string" ||
      !chapterId.trim() ||
      (options !== undefined &&
        (!Array.isArray(options) ||
          !options.every((option) => typeof option === "string"))) ||
      (explanation !== undefined &&
        typeof explanation !== "string")
    ) {
      return res.status(400).json({
        success: false,
        message:
          "question, valid type, answer and chapterId are required; options must be a string array",
      });
    }

    const exercise = await createVocabularyExercise({
      question: question.trim(),
      type,
      answer: answer.trim(),
      options,
      explanation,
      chapterId: chapterId.trim(),
    });

    return res.status(201).json({
      success: true,
      message: "Vocabulary exercise created successfully",
      exercise,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create vocabulary exercise",
    });
  }
};

export const getVocabularyExercisesByChapterController =
  async (req: Request, res: Response) => {
    try {
      const { chapterId } = req.params;

      if (typeof chapterId !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid chapter ID",
        });
      }

      const exercises =
        await getVocabularyExercisesByChapter(chapterId);

      return res.status(200).json({
        success: true,
        exercises,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch vocabulary exercises",
      });
    }
  };

export const getVocabularyExerciseByIdController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise ID",
        });
      }

      const exercise = await getVocabularyExerciseById(id);

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
            : "Vocabulary exercise not found",
      });
    }
  };

export const updateVocabularyExerciseController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const {
        question,
        type,
        answer,
        options,
        explanation,
        chapterId,
      } = req.body;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise ID",
        });
      }

      if (
        (question !== undefined &&
          (typeof question !== "string" || !question.trim())) ||
        (type !== undefined &&
          !isVocabularyExerciseType(type)) ||
        (answer !== undefined &&
          (typeof answer !== "string" || !answer.trim())) ||
        (chapterId !== undefined &&
          (typeof chapterId !== "string" || !chapterId.trim())) ||
        (options !== undefined &&
          (!Array.isArray(options) ||
            !options.every((option) => typeof option === "string"))) ||
        (explanation !== undefined &&
          typeof explanation !== "string")
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid vocabulary exercise fields",
        });
      }

      const exercise = await updateVocabularyExercise(id, {
        ...(question !== undefined && { question: question.trim() }),
        ...(type !== undefined && {
          type,
        }),
        ...(answer !== undefined && { answer: answer.trim() }),
        ...(options !== undefined && { options }),
        ...(explanation !== undefined && { explanation }),
        ...(chapterId !== undefined && {
          chapterId: chapterId.trim(),
        }),
      });

      return res.status(200).json({
        success: true,
        message: "Vocabulary exercise updated successfully",
        exercise,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update vocabulary exercise",
      });
    }
  };

export const deleteVocabularyExerciseController =
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise ID",
        });
      }

      await deleteVocabularyExercise(id);

      return res.status(200).json({
        success: true,
        message: "Vocabulary exercise deleted successfully",
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete vocabulary exercise",
      });
    }
  };

export const submitVocabularyExerciseAnswerController =
  async (req: AuthRequest, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { exerciseId, userAnswer } = req.body;
      if (
        typeof exerciseId !== "string" ||
        !exerciseId.trim() ||
        typeof userAnswer !== "string" ||
        !userAnswer.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: "exerciseId and userAnswer are required",
        });
      }

      const result = await submitVocabularyExerciseAnswer({
        userId: req.user.userId,
        exerciseId: exerciseId.trim(),
        userAnswer,
      });

      return res.status(200).json({
        success: true,
        message: "Vocabulary answer submitted successfully",
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit vocabulary answer",
      });
    }
  };
