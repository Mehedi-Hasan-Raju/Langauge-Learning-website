import { Request, Response } from "express";

import {
  createBook,
  getBooksByLevel,
  getBookById,
  updateBook,
  deleteBook,
} from "../service/book.service";

export const createBookController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, author, levelId } = req.body;

    if (!name || !levelId) {
      return res.status(400).json({
        success: false,
        message: "Name and levelId are required",
      });
    }

    const book = await createBook(
      name.trim(),
      author?.trim(),
      levelId
    );

    return res.status(201).json({
      success: true,
      message: "Book created successfully",
      book,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create book",
    });
  }
};

export const getBooksByLevelController = async (
  req: Request,
  res: Response
) => {
  try {
    const { levelId } = req.params;

    if (typeof levelId !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid level ID",
      });
    }

    const books = await getBooksByLevel(levelId);

    return res.status(200).json({
      success: true,
      books,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to fetch books",
    });
  }
};

export const getBookByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await getBookById(id);

    return res.status(200).json({
      success: true,
      book,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Book not found",
    });
  }
};

export const updateBookController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, author, levelId } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    const book = await updateBook(id, {
      ...(name !== undefined && {
        name: name.trim(),
      }),
      ...(author !== undefined && {
        author: author.trim(),
      }),
      ...(levelId !== undefined && {
        levelId,
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Book updated successfully",
      book,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update book",
    });
  }
};

export const deleteBookController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid book ID",
      });
    }

    await deleteBook(id);

    return res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete book",
    });
  }
};