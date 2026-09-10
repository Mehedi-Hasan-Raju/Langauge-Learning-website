import { Request, Response } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";
import {
  createWritingTask,
  getWritingTasksByChapter,
  getWritingTaskById,
  updateWritingTask,
  deleteWritingTask,
  submitWritingAnswer,
} from "../../service/writing/writing.service";

export const createWritingTaskController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        title,
        instruction,
        type,
        minWords,
        maxWords,
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

      const task = await createWritingTask({
        title,
        instruction,
        type,
        minWords:
          minWords !== undefined
            ? Number(minWords)
            : undefined,
        maxWords:
          maxWords !== undefined
            ? Number(maxWords)
            : undefined,
        chapterId,
      });

      return res.status(201).json({
        success: true,
        message:
          "Writing task created successfully",
        task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create writing task",
      });
    }
  };

  //get by chapter
  export const getWritingTasksByChapterController =
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

      const tasks =
        await getWritingTasksByChapter(
          chapterId
        );

      return res.status(200).json({
        success: true,
        tasks,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch writing tasks",
      });
    }
  };

//get by id 

export const getWritingTaskByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid task id",
        });
      }

      const task =
        await getWritingTaskById(id);

      return res.status(200).json({
        success: true,
        task,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Writing task not found",
      });
    }
  };

export const updateWritingTaskController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid task id",
        });
      }

      const task =
        await updateWritingTask(
          id,
          {
            title: req.body.title,
            instruction:
              req.body.instruction,
            type: req.body.type,
            minWords:
              req.body.minWords !== undefined
                ? Number(req.body.minWords)
                : undefined,
            maxWords:
              req.body.maxWords !== undefined
                ? Number(req.body.maxWords)
                : undefined,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Writing task updated successfully",
        task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update writing task",
      });
    }
  };


export const deleteWritingTaskController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid task id",
        });
      }

      await deleteWritingTask(id);

      return res.status(200).json({
        success: true,
        message:
          "Writing task deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete writing task",
      });
    }
  };


export const submitWritingAnswerController =
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
        taskId,
        answer,
      } = req.body;

      if (!taskId || answer === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "taskId and answer are required",
        });
      }

      const result =
        await submitWritingAnswer({
          userId: req.user.userId,
          taskId,
          answer: String(answer),
        });

      return res.status(200).json({
        success: true,
        message:
          "Writing answer submitted successfully",
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit writing answer",
      });
    }
  };