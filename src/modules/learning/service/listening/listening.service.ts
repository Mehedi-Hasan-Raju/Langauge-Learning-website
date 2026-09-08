import { prisma } from "../../../../lib/prisma";


interface CreateListeningExerciseInput {
  title: string;
  audioUrl: string;
  transcript?: string;
  chapterId: string;
}

export const createListeningExercise = async (
  data: CreateListeningExerciseInput
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.listeningExercise.create({
    data: {
      title: data.title.trim(),
      audioUrl: data.audioUrl.trim(),
      transcript: data.transcript?.trim(),
      chapterId: data.chapterId,
    },
  });
};

export const getListeningExercisesByChapter = async (
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

  return await prisma.listeningExercise.findMany({
    where: {
      chapterId,
    },
    include: {
      tasks: {
        orderBy: {
          taskNo: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getListeningExerciseById = async (
  id: string
) => {
  const exercise =
    await prisma.listeningExercise.findUnique({
      where: {
        id,
      },
      include: {
        tasks: {
          orderBy: {
            taskNo: "asc",
          },
        },
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

  if (!exercise) {
    throw new Error(
      "Listening exercise not found"
    );
  }

  return exercise;
};

export const updateListeningExercise = async (
  id: string,
  data: {
    title?: string;
    audioUrl?: string;
    transcript?: string;
  }
) => {
  const exercise =
    await prisma.listeningExercise.findUnique({
      where: {
        id,
      },
    });

  if (!exercise) {
    throw new Error(
      "Listening exercise not found"
    );
  }

  return await prisma.listeningExercise.update({
    where: {
      id,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title.trim(),
      }),

      ...(data.audioUrl !== undefined && {
        audioUrl: data.audioUrl.trim(),
      }),

      ...(data.transcript !== undefined && {
        transcript: data.transcript.trim(),
      }),
    },
  });
};

export const deleteListeningExercise = async (
  id: string
) => {
  const exercise =
    await prisma.listeningExercise.findUnique({
      where: {
        id,
      },
    });

  if (!exercise) {
    throw new Error(
      "Listening exercise not found"
    );
  }

  return await prisma.listeningExercise.delete({
    where: {
      id,
    },
  });
};

// ==================================================
// Listening Task
// ==================================================

interface CreateListeningTaskInput {
  listeningExerciseId: string;
  taskNo: number;
  type:
    | "MULTIPLE_CHOICE"
    | "FILL_IN_THE_GAP"
    | "LISTEN_AND_WRITE";
  question: string;
  options?: unknown;
  answer: unknown;
  explanation?: string;
}

export const createListeningTask = async (
  data: CreateListeningTaskInput
) => {
  const exercise =
    await prisma.listeningExercise.findUnique({
      where: {
        id: data.listeningExerciseId,
      },
    });

  if (!exercise) {
    throw new Error(
      "Listening exercise not found"
    );
  }

  const existingTask =
    await prisma.listeningTask.findFirst({
      where: {
        listeningExerciseId:
          data.listeningExerciseId,
        taskNo: data.taskNo,
      },
    });

  if (existingTask) {
    throw new Error(
      `Task number ${data.taskNo} already exists`
    );
  }

  return await prisma.listeningTask.create({
    data: {
      listeningExerciseId:
        data.listeningExerciseId,
      taskNo: data.taskNo,
      type: data.type,
      question: data.question.trim(),
      options: data.options as any,
      answer: data.answer as any,
      explanation:
        data.explanation?.trim(),
    },
  });
};

export const getListeningTaskById = async (
  id: string
) => {
  const task =
    await prisma.listeningTask.findUnique({
      where: {
        id,
      },
      include: {
        listeningExercise: true,
      },
    });

  if (!task) {
    throw new Error(
      "Listening task not found"
    );
  }

  return task;
};

export const updateListeningTask = async (
  id: string,
  data: {
    taskNo?: number;
    type?:
      | "MULTIPLE_CHOICE"
      | "FILL_IN_THE_GAP"
      | "LISTEN_AND_WRITE";
    question?: string;
    options?: unknown;
    answer?: unknown;
    explanation?: string;
  }
) => {
  const task =
    await prisma.listeningTask.findUnique({
      where: {
        id,
      },
    });

  if (!task) {
    throw new Error(
      "Listening task not found"
    );
  }

  if (
    data.taskNo !== undefined &&
    data.taskNo !== task.taskNo
  ) {
    const duplicate =
      await prisma.listeningTask.findFirst({
        where: {
          listeningExerciseId:
            task.listeningExerciseId,
          taskNo: data.taskNo,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new Error(
        `Task number ${data.taskNo} already exists`
      );
    }
  }

  return await prisma.listeningTask.update({
    where: {
      id,
    },
    data: {
      ...(data.taskNo !== undefined && {
        taskNo: data.taskNo,
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),

      ...(data.question !== undefined && {
        question: data.question.trim(),
      }),

      ...(data.options !== undefined && {
        options: data.options as any,
      }),

      ...(data.answer !== undefined && {
        answer: data.answer as any,
      }),

      ...(data.explanation !== undefined && {
        explanation: data.explanation.trim(),
      }),
    },
  });
};

export const deleteListeningTask = async (
  id: string
) => {
  const task =
    await prisma.listeningTask.findUnique({
      where: {
        id,
      },
    });

  if (!task) {
    throw new Error(
      "Listening task not found"
    );
  }

  return await prisma.listeningTask.delete({
    where: {
      id,
    },
  });
};


//submission 


export const submitListeningAnswer = async (data: {
  userId: string;
  taskId: string;
  userAnswer: string;
}) => {
  const task = await prisma.listeningTask.findUnique({
    where: {
      id: data.taskId,
    },
    include: {
      listeningExercise: true,
    },
  });

  if (!task) {
    throw new Error("Listening task not found");
  }

  // ------------------------------------------
  // Normalize answer
  // ------------------------------------------

  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(/[.!?,;:]+$/g, "");

  const userAnswer = normalize(
    data.userAnswer
  );

  // JSON answer -> string
  let correctAnswer = "";

  if (typeof task.answer === "string") {
    correctAnswer = task.answer;
  } else if (Array.isArray(task.answer)) {
    correctAnswer = task.answer
      .map((item) => String(item))
      .join(" ");
  } else {
    correctAnswer = String(task.answer);
  }

  const normalizedCorrectAnswer =
    normalize(correctAnswer);

  const isCorrect =
    userAnswer === normalizedCorrectAnswer;

  const score = isCorrect ? 100 : 0;

  // ------------------------------------------
  // Save submission
  // ------------------------------------------

  const submission =
    await prisma.listeningSubmission.create({
      data: {
        userId: data.userId,
        taskId: data.taskId,
        userAnswer: data.userAnswer,
        isCorrect,
        score,
      },
    });

  // ------------------------------------------
  // Find all tasks of this chapter
  // ------------------------------------------

  const chapterId =
    task.listeningExercise.chapterId;

  const totalTasks =
    await prisma.listeningTask.count({
      where: {
        listeningExercise: {
          chapterId,
        },
      },
    });

  // ------------------------------------------
  // Get all user submissions
  // ------------------------------------------

  const submissions =
    await prisma.listeningSubmission.findMany({
      where: {
        userId: data.userId,
        task: {
          listeningExercise: {
            chapterId,
          },
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

  const latestSubmissions = Array.from(
    latestByTask.values()
  );

  // ------------------------------------------
  // Attempts %
  // ------------------------------------------

  const completedTasks =
    latestSubmissions.length;

  const listeningProgress =
    totalTasks === 0
      ? 0
      : Math.min(
          100,
          (completedTasks / totalTasks) * 100
        );

  // ------------------------------------------
  // Accuracy
  // ------------------------------------------

  const accuracy =
    latestSubmissions.length === 0
      ? 0
      : latestSubmissions.reduce(
          (sum, item) => sum + item.score,
          0
        ) / latestSubmissions.length;

  // ------------------------------------------
  // Skill Progress
  // ------------------------------------------

  const oldSkillProgress =
    await prisma.skillProgress.findUnique({
      where: {
        userId_skill: {
          userId: data.userId,
          skill: "LISTENING",
        },
      },
    });

  await prisma.skillProgress.upsert({
    where: {
      userId_skill: {
        userId: data.userId,
        skill: "LISTENING",
      },
    },
    create: {
      userId: data.userId,
      skill: "LISTENING",
      completedTasks: completedTasks,
      totalTasks: totalTasks,
      currentScore: accuracy,
      previousScore: 0,
    },
    update: {
      completedTasks: completedTasks,
      totalTasks: totalTasks,
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
          userId: data.userId,
          chapterId,
        },
      },
    });

  const grammarProgress =
    oldProgress?.grammarProgress ?? 0;

  const vocabularyProgress =
    oldProgress?.vocabularyProgress ?? 0;

  const writingProgress =
    oldProgress?.writingProgress ?? 0;

  const sentenceProgress =
    oldProgress?.sentenceProgress ?? 0;

  // Speaking is intentionally excluded

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
        userId: data.userId,
        chapterId,
      },
    },
    create: {
      userId: data.userId,
      chapterId,
      grammarProgress,
      vocabularyProgress,
      listeningProgress,
      writingProgress,
      sentenceProgress,
      overallProgress,
    },
    update: {
      listeningProgress,
      overallProgress,
    },
  });

  // ------------------------------------------
  // Activity Record
  // ------------------------------------------

  await prisma.activityRecord.create({
    data: {
      userId: data.userId,
      skill: "LISTENING",
      activityType: "LISTENING_TASK",
      referenceId: data.taskId,
      score,
      durationMinutes: 0,
    },
  });

  // ------------------------------------------
  // Daily Activity + Streak
  // ------------------------------------------

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(
    tomorrow.getDate() + 1
  );

  const yesterday = new Date(today);
  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const dailyActivity =
    await prisma.dailyActivity.findFirst({
      where: {
        userId: data.userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

  if (dailyActivity) {
    await prisma.dailyActivity.update({
      where: {
        id: dailyActivity.id,
      },
      data: {
        completedTasks: {
          increment: 1,
        },
        listeningCompleted: {
          increment: 1,
        },
      },
    });
  } else {
    await prisma.dailyActivity.create({
      data: {
        userId: data.userId,
        date: today,
        completedTasks: 1,
        listeningCompleted: 1,
      },
    });
  }

  // ------------------------------------------
  // Streak
  // ------------------------------------------

  const profile =
    await prisma.userProfile.findUnique({
      where: {
        userId: data.userId,
      },
    });

  let currentStreak = 1;

  if (profile?.lastActiveDate) {
    const lastActive =
      new Date(profile.lastActiveDate);

    lastActive.setHours(0, 0, 0, 0);

    if (
      lastActive.getTime() ===
      today.getTime()
    ) {
      currentStreak =
        profile.currentStreak;
    } else if (
      lastActive.getTime() ===
      yesterday.getTime()
    ) {
      currentStreak =
        profile.currentStreak + 1;
    }
  }

  const longestStreak = Math.max(
    profile?.longestStreak ?? 0,
    currentStreak
  );

  await prisma.userProfile.upsert({
    where: {
      userId: data.userId,
    },
    create: {
      userId: data.userId,
      currentStreak,
      longestStreak,
      lastActiveDate: new Date(),
    },
    update: {
      currentStreak,
      longestStreak,
      lastActiveDate: new Date(),
    },
  });

  // ------------------------------------------
  // Return result
  // ------------------------------------------

  return {
    submission,

    result: {
      isCorrect,
      correctAnswer,
      explanation:
        task.explanation,
    },

    progress: {
      completedTasks,
      totalTasks,
      attemptsPercentage:
        listeningProgress,
      accuracy,
    },
  };
};