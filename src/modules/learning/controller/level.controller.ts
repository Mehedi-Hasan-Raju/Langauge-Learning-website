import { Request, Response } from "express";
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
} from "../service/level.service";

export const createLevelController = async (
  req: Request,
  res: Response
) => {
  try {
    const { name, order } = req.body;

    if (!name || order === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name and order are required",
      });
    }

    const level = await createLevel(
      name.trim(),
      Number(order)
    );

    return res.status(201).json({
      success: true,
      message: "Level created successfully",
      level,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to create level",
    });
  }
};

export const getAllLevelsController = async (
  req: Request,
  res: Response
) => {
  try {
    const levels = await getAllLevels();

    return res.status(200).json({
      success: true,
      levels,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch levels",
    });
  }
};

export const getLevelByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

     if (typeof id !== "string") {
     return res.status(400).json({
     success: false,
     message: "Invalid level ID",
      });
     }

    const level = await getLevelById(id);

    return res.status(200).json({
      success: true,
      level,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Level not found",
    });
  }
};

export const updateLevelController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { name, order } = req.body;

    if (typeof id !== "string") {
    return res.status(400).json({
    success: false,
    message: "Invalid level ID",
     });
   }

    const level = await updateLevel(id, {
      ...(name !== undefined && {
        name: name.trim(),
      }),
      ...(order !== undefined && {
        order: Number(order),
      }),
    });

    return res.status(200).json({
      success: true,
      message: "Level updated successfully",
      level,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to update level",
    });
  }
};

export const deleteLevelController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;

     if (typeof id !== "string") {
    return res.status(400).json({
    success: false,
    message: "Invalid level ID",
    });
  }

    await deleteLevel(id);

    return res.status(200).json({
      success: true,
      message: "Level deleted successfully",
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to delete level",
    });
  }
};