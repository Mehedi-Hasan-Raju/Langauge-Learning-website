import { Request, Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";

import {
  createChapter,
  getChaptersByBook,
  getChapterById,
  updateChapter,
  deleteChapter,
} from "../service/chapter.service";

export const createChapterController = async (
  req: Request,
  res: Response
) => {
  try {
    const {
      title,
      chapterNo,
      sectionNo,
      accessType,
      bookId,
    } = req.body;

    if (
      !title ||
      chapterNo === undefined ||
      sectionNo === undefined ||
      !bookId
    ) {
      return res.status(400).json({
        success: false,
        message:
          "title, chapterNo, sectionNo and bookId are required",
      });
    }

    const chapter = await createChapter(
      title.trim(),
      Number(chapterNo),
      Number(sectionNo),
      accessType ?? "FREE",
      bookId
    );

    return res.status(201).json({
      success: true,
      message: "Chapter created successfully",
      chapter,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create chapter",
    });
  }
};

export const getChaptersByBookController = async (
  req: Request,
  res: Response
) => {
  try {
    const { bookId } = req.params;

    if (typeof bookId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const chapters = await getChaptersByBook(bookId);

    return res.status(200).json({
      success: true,
      chapters,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch chapters",
    });
  }
};

export const getChapterByIdController = async (
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

    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid chapter ID",
      });
    }

    const chapter = await getChapterById(
      id,
      req.user.userId,
      req.user.role
    );

    return res.status(200).json({
      success: true,
      chapter,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Failed to fetch chapter";

    if (
      message ===
      "Premium subscription is required to access this chapter"
    ) {
      return res.status(403).json({
        success: false,
        message,
        code: "PREMIUM_REQUIRED",
      });
    }

    if (
      message ===
      "Complete the previous chapter first"
    ) {
      return res.status(403).json({
        success: false,
        message,
        code: "PREVIOUS_CHAPTER_INCOMPLETE",
      });
    }

    return res.status(404).json({
      success: false,
      message,
    });
  }
};

export const updateChapterController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid chapter ID",
      });
    }

    const {
      title,
      chapterNo,
      sectionNo,
      accessType,
    } = req.body;

    const chapter = await updateChapter(id, {
      ...(title !== undefined && {
        title: title.trim(),
      }),
      ...(chapterNo !== undefined && {
        chapterNo: Number(chapterNo),
      }),
      ...(sectionNo !== undefined && {
        sectionNo: Number(sectionNo),
      }),
      ...(accessType !== undefined && {
        accessType,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Chapter updated successfully",
      chapter,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update chapter",
    });
  }
};

export const deleteChapterController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid chapter ID",
      });
    }

    await deleteChapter(id);

    return res.status(200).json({
      success: true,
      message: "Chapter deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete chapter",
    });
  }
};