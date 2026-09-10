import { prisma } from "../../../../lib/prisma";
import {evaluateGermanWriting,} from "./gemini-writing.service";


interface CreateWritingTaskInput {
  title: string;
  instruction: string;
  type:
    | "FILL_IN_THE_GAP"
    | "EMAIL"
    | "SHORT_MESSAGE";
  minWords?: number;
  maxWords?: number;
  answer?: string;
  chapterId: string;
}

export const createWritingTask = async (
  data: CreateWritingTaskInput
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.writingTask.create({
    data: {
      title: data.title.trim(),
      instruction: data.instruction.trim(),
      type: data.type,
      minWords: data.minWords,
      maxWords: data.maxWords,
      answer: data.answer?.trim(),
      chapterId: data.chapterId,
    },
  });
};

export const getWritingTasksByChapter = async (
  chapterId: string
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.writingTask.findMany({
    where: {
      chapterId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getWritingTaskById = async (
  id: string
) => {
  const task = await prisma.writingTask.findUnique({
    where: {
      id,
    },
    include: {
      chapter: {
        include: {
          book: {
            include: {
              level: true,
            },
          },
        },
      },
    },
  });

  if (!task) {
    throw new Error("Writing task not found");
  }

  return task;
};

export const updateWritingTask = async (
  id: string,
  data: {
    title?: string;
    instruction?: string;
    type?:
      | "FILL_IN_THE_GAP"
      | "EMAIL"
      | "SHORT_MESSAGE";
    minWords?: number | null;
    maxWords?: number | null;
    answer?: string | null;
  }
) => {
  const task = await prisma.writingTask.findUnique({
    where: {
      id,
    },
  });

  if (!task) {
    throw new Error("Writing task not found");
  }

  return await prisma.writingTask.update({
    where: {
      id,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title.trim(),
      }),

      ...(data.instruction !== undefined && {
        instruction: data.instruction.trim(),
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),

      ...(data.minWords !== undefined && {
        minWords: data.minWords,
      }),

      ...(data.maxWords !== undefined && {
        maxWords: data.maxWords,
      }),
      ...(data.answer !== undefined && {
       answer:
        data.answer === null
       ? null
       : data.answer.trim(),
     }),
    },
  });
};

export const deleteWritingTask = async (
  id: string
) => {
  const task = await prisma.writingTask.findUnique({
    where: {
      id,
    },
  });

  if (!task) {
    throw new Error("Writing task not found");
  }

  return await prisma.writingTask.delete({
    where: {
      id,
    },
  });
};



export const submitWritingAnswer = async (data: {
  userId: string;
  taskId: string;
  answer: string;
}) => {
  const task = await prisma.writingTask.findUnique({
    where: {
      id: data.taskId,
    },
  });

  if (!task) {
    throw new Error(
      "Writing task not found"
    );
  }

  const userAnswer = data.answer.trim();

  if (!userAnswer) {
    throw new Error(
      "Answer cannot be empty"
    );
  }

 const updateWritingProgressAfterSubmission =
  async (
    userId: string,
    chapterId: string,
    currentScore: number,
    taskId: string,
    submission: any
  ) => {
    // ------------------------------------------
    // Total writing tasks
    // ------------------------------------------

    const totalTasks =
      await prisma.writingTask.count({
        where: {
          chapterId,
        },
      });

    // ------------------------------------------
    // User submissions
    // ------------------------------------------

    const submissions =
      await prisma.writingSubmission.findMany({
        where: {
          userId,
          task: {
            chapterId,
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    // ------------------------------------------
    // Latest submission per task
    // ------------------------------------------

    const latestByTask = new Map<
      string,
      (typeof submissions)[number]
    >();

    for (const item of submissions) {
      if (!latestByTask.has(item.taskId)) {
        latestByTask.set(
          item.taskId,
          item
        );
      }
    }

    const latestSubmissions =
      Array.from(latestByTask.values());

    const completedTasks =
      latestSubmissions.length;

    // ------------------------------------------
    // Attempts %
    // ------------------------------------------

    const writingProgress =
      totalTasks === 0
        ? 0
        : Math.min(
            100,
            (completedTasks /
              totalTasks) *
              100
          );

    // ------------------------------------------
    // Accuracy
    // ------------------------------------------

    const accuracy =
      latestSubmissions.length === 0
        ? 0
        : latestSubmissions.reduce(
            (sum, item) =>
              sum + (item.score ?? 0),
            0
          ) /
          latestSubmissions.length;

    // ------------------------------------------
    // Skill Progress
    // ------------------------------------------

    const oldSkillProgress =
      await prisma.skillProgress.findUnique({
        where: {
          userId_skill: {
            userId,
            skill: "SCHREIBEN",
          },
        },
      });

    await prisma.skillProgress.upsert({
      where: {
        userId_skill: {
          userId,
          skill: "SCHREIBEN",
        },
      },
      create: {
        userId,
        skill: "SCHREIBEN",
        completedTasks,
        totalTasks,
        currentScore: accuracy,
        previousScore: 0,
      },
      update: {
        completedTasks,
        totalTasks,
        currentScore: accuracy,
        previousScore:
          oldSkillProgress?.currentScore ?? 0,
      },
    });

    // ------------------------------------------
    // User Progress
    // ------------------------------------------

    const oldProgress =
      await prisma.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId,
          },
        },
      });

    const grammarProgress =
      oldProgress?.grammarProgress ?? 0;

    const vocabularyProgress =
      oldProgress?.vocabularyProgress ?? 0;

    const listeningProgress =
      oldProgress?.listeningProgress ?? 0;

    const sentenceProgress =
      oldProgress?.sentenceProgress ?? 0;

    const overallProgress =
      (
        grammarProgress +
        vocabularyProgress +
        listeningProgress +
        writingProgress +
        sentenceProgress
      ) / 5;

    await prisma.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      create: {
        userId,
        chapterId,
        grammarProgress,
        vocabularyProgress,
        listeningProgress,
        writingProgress,
        sentenceProgress,
        overallProgress,
      },
      update: {
        writingProgress,
        overallProgress,
      },
    });

    // ------------------------------------------
    // Activity Record
    // ------------------------------------------

    await prisma.activityRecord.create({
      data: {
        userId,
        skill: "SCHREIBEN",
        activityType: "WRITING_TASK",
        referenceId: taskId,
        score: currentScore,
        durationMinutes: 0,
      },
    });

    return {
      submission,

      result: {
        score: currentScore,
        feedback:
          submission.feedback,
      },

      progress: {
        completedTasks,
        totalTasks,
        attemptsPercentage:
          writingProgress,
        accuracy,
      },
    };
  };


  // ==========================================
  // FILL IN THE GAP
  // ==========================================

  if (task.type === "FILL_IN_THE_GAP") {
    if (!task.answer) {
      throw new Error(
        "Correct answer is not configured for this task"
      );
    }

    const normalize = (value: string) =>
      value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[.!?,;:]+$/g, "");

    const normalizedUserAnswer =
      normalize(userAnswer);

    const normalizedCorrectAnswer =
      normalize(task.answer);

    const isCorrect =
      normalizedUserAnswer ===
      normalizedCorrectAnswer;

    const score = isCorrect ? 100 : 0;

    const submission =
      await prisma.writingSubmission.create({
        data: {
          userId: data.userId,
          taskId: data.taskId,
          answer: userAnswer,
          score,
          feedback: {
            evaluationType: "EXACT_MATCH",
            isCorrect,
            correctAnswer: task.answer,
          },
        },
      });

    return await updateWritingProgressAfterSubmission(
      data.userId,
      task.chapterId,
      score,
      data.taskId,
      submission
    );
  }

  // ==========================================
  // EMAIL / SHORT MESSAGE
  // ==========================================

  const evaluation =
    await evaluateGermanWriting({
      taskTitle: task.title,
      instruction: task.instruction,
      type: task.type,
      minWords: task.minWords,
      maxWords: task.maxWords,
      answer: userAnswer,
    });

  const score = Math.max(
    0,
    Math.min(100, Number(evaluation.score))
  );

  const submission =
    await prisma.writingSubmission.create({
      data: {
        userId: data.userId,
        taskId: data.taskId,
        answer: userAnswer,
        score,
        feedback: evaluation,
      },
    });

  return await updateWritingProgressAfterSubmission(
    data.userId,
    task.chapterId,
    score,
    data.taskId,
    submission
  );
};

