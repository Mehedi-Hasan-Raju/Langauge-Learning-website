import { Request, Response } from "express";
import multer from "multer";
import {uploadListeningAudio,} from "../../../../lib/cloudinary-audio"
import {AuthRequest,} from "../../../../middlewares/auth.middleware";
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
  submitListeningAnswer,
} from "../../service/listening/listening.service";


const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "audio/mpeg") {
      cb(null, true);
      return;
    }

    cb(
      new Error(
        "Only MP3 audio files are allowed"
      )
    );
  },
});

export const createListeningExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        title,
        transcript,
        chapterId,
      } = req.body;

      if (!title || !chapterId) {
        return res.status(400).json({
          success: false,
          message:
            "title and chapterId are required",
        });
      }

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "MP3 audio file is required",
        });
      }

      const uploadedAudio =
        await uploadListeningAudio(
          req.file.buffer,
          req.file.originalname
        );

      const exercise =
        await createListeningExercise({
          title,
          audioUrl:
            uploadedAudio.secure_url,
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


  export const getListeningExercisesByChapterController =
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

      const exercises =
        await getListeningExercisesByChapter(
          chapterId
        );

      return res.status(200).json({
        success: true,
        exercises,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch listening exercises",
      });
    }
  };

  export const getListeningExerciseByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise id",
        });
      }

      const exercise =
        await getListeningExerciseById(id);

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
            : "Listening exercise not found",
      });
    }
  };

export const updateListeningExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise id",
        });
      }

      const exercise =
        await updateListeningExercise(
          id,
          {
            title: req.body.title,
            transcript:
              req.body.transcript,
            audioBuffer:
              req.file?.buffer,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Listening exercise updated successfully",
        exercise,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update listening exercise",
      });
    }
  };

export const deleteListeningExerciseController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid exercise id",
        });
      }

      await deleteListeningExercise(id);

      return res.status(200).json({
        success: true,
        message:
          "Listening exercise deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete listening exercise",
      });
    }
  };




 export const createListeningTaskController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        listeningExerciseId,
        taskNo,
        type,
        question,
        options,
        answer,
        explanation,
      } = req.body;

      if (
        !listeningExerciseId ||
        taskNo === undefined ||
        !type ||
        !question ||
        answer === undefined
      ) {
        return res.status(400).json({
          success: false,
          message:
            "listeningExerciseId, taskNo, type, question and answer are required",
        });
      }

      const task =
        await createListeningTask({
          listeningExerciseId,
          taskNo: Number(taskNo),
          type,
          question,
          options,
          answer,
          explanation,
        });

      return res.status(201).json({
        success: true,
        message:
          "Listening task created successfully",
        task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create listening task",
      });
    }
  }; 


  export const getListeningTaskByIdController =
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
        await getListeningTaskById(id);

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
            : "Listening task not found",
      });
    }
  };

  export const updateListeningTaskController =
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
        await updateListeningTask(
          id,
          req.body
        );

      return res.status(200).json({
        success: true,
        message:
          "Listening task updated successfully",
        task,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update listening task",
      });
    }
  };

  export const deleteListeningTaskController =
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

      await deleteListeningTask(id);

      return res.status(200).json({
        success: true,
        message:
          "Listening task deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete listening task",
      });
    }
  };


  export const submitListeningAnswerController =
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
        userAnswer,
      } = req.body;

      if (!taskId || userAnswer === undefined) {
        return res.status(400).json({
          success: false,
          message:
            "taskId and userAnswer are required",
        });
      }

      const result =
        await submitListeningAnswer({
          userId: req.user.userId,
          taskId,
          userAnswer: String(userAnswer),
        });

      return res.status(200).json({
        success: true,
        message:
          "Listening answer submitted successfully",
        ...result,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to submit listening answer",
      });
    }
  };