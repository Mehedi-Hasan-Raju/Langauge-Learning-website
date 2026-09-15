import { prisma } from "../../../../lib/prisma";

interface CreateSentenceExerciseInput {
  taskNo: number;
  question: string;
  words: string[];
  answer: string;
  explanation?: string;
  chapterId: string;
}

export const createSentenceExercise = async (
  data: CreateSentenceExerciseInput
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  const existing =
    await prisma.sentenceExercise.findFirst({
      where: {
        chapterId: data.chapterId,
        taskNo: data.taskNo,
      },
    });

  if (existing) {
    throw new Error(
      `Task number ${data.taskNo} already exists`
    );
  }

  return await prisma.sentenceExercise.create({
    data: {
      taskNo: data.taskNo,
      question: data.question.trim(),
      words: data.words,
      answer: data.answer.trim(),
      explanation:
        data.explanation?.trim(),
      chapterId: data.chapterId,
    },
  });
};

export const getSentenceExercisesByChapter =
  async (chapterId: string) => {
    const chapter =
      await prisma.chapter.findUnique({
        where: {
          id: chapterId,
        },
      });

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    return await prisma.sentenceExercise.findMany({
      where: {
        chapterId,
      },
      orderBy: {
        taskNo: "asc",
      },
    });
  };

export const getSentenceExerciseById = async (
  id: string
) => {
  const exercise =
    await prisma.sentenceExercise.findUnique({
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

  if (!exercise) {
    throw new Error(
      "Sentence exercise not found"
    );
  }

  return exercise;
};

export const updateSentenceExercise = async (
  id: string,
  data: {
    taskNo?: number;
    question?: string;
    words?: string[];
    answer?: string;
    explanation?: string;
  }
) => {
  const exercise =
    await prisma.sentenceExercise.findUnique({
      where: {
        id,
      },
    });

  if (!exercise) {
    throw new Error(
      "Sentence exercise not found"
    );
  }

  if (
    data.taskNo !== undefined &&
    data.taskNo !== exercise.taskNo
  ) {
    const duplicate =
      await prisma.sentenceExercise.findFirst({
        where: {
          chapterId: exercise.chapterId,
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

  return await prisma.sentenceExercise.update({
    where: {
      id,
    },
    data: {
      ...(data.taskNo !== undefined && {
        taskNo: data.taskNo,
      }),

      ...(data.question !== undefined && {
        question: data.question.trim(),
      }),

      ...(data.words !== undefined && {
        words: data.words,
      }),

      ...(data.answer !== undefined && {
        answer: data.answer.trim(),
      }),

      ...(data.explanation !== undefined && {
        explanation: data.explanation.trim(),
      }),
    },
  });
};

export const deleteSentenceExercise = async (
  id: string
) => {
  const exercise =
    await prisma.sentenceExercise.findUnique({
      where: {
        id,
      },
    });

  if (!exercise) {
    throw new Error(
      "Sentence exercise not found"
    );
  }

  return await prisma.sentenceExercise.delete({
    where: {
      id,
    },
  });
};


//answer subission

export const submitSentenceAnswer = async (data: {
  userId: string;
  exerciseId: string;
  userAnswer: string;
}) => {
  const exercise =
    await prisma.sentenceExercise.findUnique({
      where: {
        id: data.exerciseId,
      },
    });

  if (!exercise) {
    throw new Error(
      "Sentence exercise not found"
    );
  }

  const userAnswer = data.userAnswer.trim();

  if (!userAnswer) {
    throw new Error(
      "Answer cannot be empty"
    );
  }

  // ------------------------------------------
  // Normalize sentence
  // ------------------------------------------

  const normalize = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ")
      .replace(
        /\s+([.,!?;:])/g,
        "$1"
      )
      .replace(/[.!?,;:]+$/g, "");

  const normalizedUserAnswer =
    normalize(userAnswer);

  const normalizedCorrectAnswer =
    normalize(exercise.answer);

  const isCorrect =
    normalizedUserAnswer ===
    normalizedCorrectAnswer;

  const score = isCorrect ? 100 : 0;

  // ------------------------------------------
  // Save submission
  // ------------------------------------------

  const submission =
    await prisma.sentenceSubmission.create({
      data: {
        userId: data.userId,
        exerciseId: data.exerciseId,
        userAnswer,
        isCorrect,
        score,
      },
    });

  // ------------------------------------------
  // Total sentence exercises in chapter
  // ------------------------------------------

  const chapterId =
    exercise.chapterId;

  const totalTasks =
    await prisma.sentenceExercise.count({
      where: {
        chapterId,
      },
    });

  // ------------------------------------------
  // All user submissions
  // ------------------------------------------

  const submissions =
    await prisma.sentenceSubmission.findMany({
      where: {
        userId: data.userId,
        exercise: {
          chapterId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  // ------------------------------------------
  // Latest submission per exercise
  // ------------------------------------------

  const latestByExercise = new Map<
    string,
    (typeof submissions)[number]
  >();

  for (const item of submissions) {
    if (
      !latestByExercise.has(
        item.exerciseId
      )
    ) {
      latestByExercise.set(
        item.exerciseId,
        item
      );
    }
  }

  const latestSubmissions =
    Array.from(
      latestByExercise.values()
    );

  // ------------------------------------------
  // Attempts %
  // ------------------------------------------

  const completedTasks =
    latestSubmissions.length;

  const sentenceProgress =
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
            sum + item.score,
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
          userId: data.userId,
          skill: "SENTENCE_BUILDING",
        },
      },
    });

  await prisma.skillProgress.upsert({
    where: {
      userId_skill: {
        userId: data.userId,
        skill: "SENTENCE_BUILDING",
      },
    },
    create: {
      userId: data.userId,
      skill: "SENTENCE_BUILDING",
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
          userId: data.userId,
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

  const writingProgress =
    oldProgress?.writingProgress ?? 0;

  // Sprechen excluded
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
      sentenceProgress,
      overallProgress,
    },
  });

  // ------------------------------------------
  // Activity Record
  // ------------------------------------------

  await prisma.activityRecord.create({
    data: {
      userId: data.userId,
      skill: "SENTENCE_BUILDING",
      activityType:
        "SENTENCE_BUILDING_TASK",
      referenceId: data.exerciseId,
      score,
      durationMinutes: 0,
    },
  });

  // ------------------------------------------
  // Daily Activity
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
        sentenceCompleted: {
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
        sentenceCompleted: 1,
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

  return {
    submission,

    result: {
      isCorrect,
      correctAnswer: exercise.answer,
      explanation:
        exercise.explanation,
    },

    progress: {
      completedTasks,
      totalTasks,
      attemptsPercentage:
        sentenceProgress,
      accuracy,
    },
  };
};