import { prisma } from "../../../../lib/prisma";

type GrammarQuestionType =
  | "MULTIPLE_CHOICE"
  | "FILL_IN_THE_GAP";

type GrammarQuestionData = {
  taskNo: number;
  question: string;
  type: GrammarQuestionType;
  answer: string;
  options?: string[];
  explanation?: string;
  grammarId: string;
  practiceChapterId: string;
};

const validatePracticeChapter = async (
  grammarId: string,
  practiceChapterId: string
) => {
  const topic = await prisma.grammarTopic.findUnique({
    where: {
      id: grammarId,
    },
    include: {
      chapter: {
        select: {
          bookId: true,
          chapterNo: true,
        },
      },
    },
  });

  if (!topic) {
    throw new Error("Grammar topic not found");
  }

  const practiceChapter = await prisma.chapter.findUnique({
    where: {
      id: practiceChapterId,
    },
    select: {
      bookId: true,
      chapterNo: true,
      sectionNo: true,
    },
  });

  if (!practiceChapter) {
    throw new Error("Practice chapter not found");
  }

  if (
    practiceChapter.bookId !== topic.chapter.bookId ||
    practiceChapter.chapterNo !== topic.chapter.chapterNo
  ) {
    throw new Error(
      "Practice chapter must belong to the same book and chapter as the grammar topic"
    );
  }

  if (practiceChapter.sectionNo <= 0) {
    throw new Error("Practice chapter must be a subchapter");
  }
};

export const createGrammarQuestion = async (
  data: GrammarQuestionData
) => {
  await validatePracticeChapter(
    data.grammarId,
    data.practiceChapterId
  );

  const existing = await prisma.grammarQuestion.findFirst({
    where: {
      grammarId: data.grammarId,
      practiceChapterId: data.practiceChapterId,
      taskNo: data.taskNo,
    },
  });

  if (existing) {
    throw new Error(
      "Question with this task number already exists"
    );
  }

  return await prisma.grammarQuestion.create({
    data: {
      taskNo: data.taskNo,
      question: data.question,
      type: data.type,
      answer: data.answer,
      options: data.options,
      explanation: data.explanation,
      grammarId: data.grammarId,
      practiceChapterId: data.practiceChapterId,
    },
    include: {
      grammar: true,
      practiceChapter: true,
    },
  });
};

export const getGrammarQuestionById = async (
  id: string
) => {
  const question =
    await prisma.grammarQuestion.findUnique({
      where: {
        id,
      },
      include: {
        grammar: true,
        practiceChapter: true,
      },
    });

  if (!question) {
    throw new Error("Grammar question not found");
  }

  return question;
};

export const updateGrammarQuestion = async (
  id: string,
  data: Partial<Omit<GrammarQuestionData, "grammarId">>
) => {
  const question =
    await prisma.grammarQuestion.findUnique({
      where: {
        id,
      },
    });

  if (!question) {
    throw new Error("Grammar question not found");
  }

  const practiceChapterId =
    data.practiceChapterId ?? question.practiceChapterId;

  if (data.practiceChapterId !== undefined) {
    await validatePracticeChapter(
      question.grammarId,
      data.practiceChapterId
    );
  }

  if (
    data.taskNo !== undefined ||
    data.practiceChapterId !== undefined
  ) {
    const duplicate =
      await prisma.grammarQuestion.findFirst({
        where: {
          grammarId: question.grammarId,
          practiceChapterId,
          taskNo: data.taskNo ?? question.taskNo,
          NOT: {
            id,
          },
        },
      });

    if (duplicate) {
      throw new Error(
        "Question with this task number already exists"
      );
    }
  }

  return await prisma.grammarQuestion.update({
    where: {
      id,
    },
    data: {
      ...(data.taskNo !== undefined && {
        taskNo: data.taskNo,
      }),
      ...(data.question !== undefined && {
        question: data.question,
      }),
      ...(data.type !== undefined && {
        type: data.type,
      }),
      ...(data.answer !== undefined && {
        answer: data.answer,
      }),
      ...(data.options !== undefined && {
        options: data.options,
      }),
      ...(data.explanation !== undefined && {
        explanation: data.explanation,
      }),
      ...(data.practiceChapterId !== undefined && {
        practiceChapterId: data.practiceChapterId,
      }),
    },
    include: {
      grammar: true,
      practiceChapter: true,
    },
  });
};

export const deleteGrammarQuestion = async (
  id: string
) => {
  const question =
    await prisma.grammarQuestion.findUnique({
      where: {
        id,
      },
    });

  if (!question) {
    throw new Error("Grammar question not found");
  }

  return await prisma.grammarQuestion.delete({
    where: {
      id,
    },
    include: {
      grammar: true,
      practiceChapter: true,
    },
  });
};
//=====================
//submit
//=====================
export const submitGrammarAnswer = async (
  userId: string,
  questionId: string,
  userAnswer: string
) => {
  const question = await prisma.grammarQuestion.findUnique({
    where: {
      id: questionId,
    },
    include: {
      practiceChapter: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!question) {
    throw new Error("Grammar question not found");
  }

  const normalizedUserAnswer = userAnswer
    .trim()
    .toLowerCase();

  const normalizedCorrectAnswer = question.answer
    .trim()
    .toLowerCase();

  const isCorrect =
    normalizedUserAnswer === normalizedCorrectAnswer;

  const score = isCorrect ? 100 : 0;

  // =========================================
  // CHECK EXISTING SUBMISSION
  // =========================================

  const existingSubmission =
    await prisma.grammarSubmission.findFirst({
      where: {
        userId,
        questionId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

  let submission;

  // =========================================
  // UPDATE EXISTING OR CREATE NEW
  // =========================================

  if (existingSubmission) {
    submission = await prisma.grammarSubmission.update({
      where: {
        id: existingSubmission.id,
      },
      data: {
        userAnswer: userAnswer.trim(),
        isCorrect,
        score,
      },
    });
  } else {
    submission = await prisma.grammarSubmission.create({
      data: {
        userId,
        questionId,
        userAnswer: userAnswer.trim(),
        isCorrect,
        score,
      },
    });
  }

  // =========================================
  // GET ALL QUESTIONS IN THIS CHAPTER
  // =========================================

  const totalQuestions =
    await prisma.grammarQuestion.count({
      where: {
        practiceChapterId: question.practiceChapterId,
      },
    });

  // =========================================
  // GET UNIQUE ANSWERED QUESTIONS
  // =========================================

  const answeredRecords =
    await prisma.grammarSubmission.findMany({
      where: {
        userId,
        question: {
          practiceChapterId: question.practiceChapterId,
        },
      },
      select: {
        questionId: true,
      },
      distinct: ["questionId"],
    });

  const completedQuestions =
    answeredRecords.length;

  // =========================================
  // GRAMMAR PRACTICE PROGRESS
  // =========================================

  const grammarProgress =
    totalQuestions > 0
      ? Math.min(
          100,
          Number(
            (
              (completedQuestions / totalQuestions) *
              100
            ).toFixed(2)
          )
        )
      : 0;

  // =========================================
  // GET LATEST SUBMISSION FOR EACH QUESTION
  // =========================================

  const allSubmissions =
    await prisma.grammarSubmission.findMany({
      where: {
        userId,
        question: {
          practiceChapterId: question.practiceChapterId,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        questionId: true,
        score: true,
        createdAt: true,
      },
    });

  // Keep only latest submission per question
  const latestSubmissions = new Map<
    string,
    number
  >();

  for (const item of allSubmissions) {
    if (!latestSubmissions.has(item.questionId)) {
      latestSubmissions.set(
        item.questionId,
        item.score
      );
    }
  }

  const latestScores = Array.from(
    latestSubmissions.values()
  );

  const currentScore =
    latestScores.length > 0
      ? Number(
          (
            latestScores.reduce(
              (sum, score) => sum + score,
              0
            ) / latestScores.length
          ).toFixed(2)
        )
      : 0;

  // =========================================
  // GET EXISTING SKILL PROGRESS
  // =========================================

  const existingSkillProgress =
    await prisma.skillProgress.findUnique({
      where: {
        userId_skill: {
          userId,
          skill: "GRAMMAR",
        },
      },
    });

  // =========================================
  // UPDATE SKILL PROGRESS
  // =========================================

  await prisma.skillProgress.upsert({
    where: {
      userId_skill: {
        userId,
        skill: "GRAMMAR",
      },
    },
    create: {
      userId,
      skill: "GRAMMAR",
      completedTasks: completedQuestions,
      totalTasks: totalQuestions,
      currentScore,
      previousScore: 0,
    },
    update: {
      completedTasks: completedQuestions,
      totalTasks: totalQuestions,
      previousScore:
        existingSkillProgress?.currentScore ?? 0,
      currentScore,
    },
  });

  // =========================================
  // GET EXISTING CHAPTER PROGRESS
  // =========================================

  const existingChapterProgress =
    await prisma.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId: question.practiceChapter.id,
        },
      },
    });

  const vocabularyProgress =
    existingChapterProgress?.vocabularyProgress ?? 0;

  const listeningProgress =
    existingChapterProgress?.listeningProgress ?? 0;

  const writingProgress =
    existingChapterProgress?.writingProgress ?? 0;

  const sentenceProgress =
    existingChapterProgress?.sentenceProgress ?? 0;

  // Sprechen intentionally excluded
  const overallProgress = Number(
    (
      (
        grammarProgress +
        vocabularyProgress +
        listeningProgress +
        writingProgress +
        sentenceProgress
      ) / 5
    ).toFixed(2)
  );

  // =========================================
  // UPDATE CHAPTER PROGRESS
  // =========================================

  const chapterProgress =
    await prisma.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId,
          chapterId: question.practiceChapter.id,
        },
      },
      create: {
        userId,
        chapterId: question.practiceChapter.id,

        grammarProgress: grammarProgress,
        vocabularyProgress: 0,
        listeningProgress: 0,
        writingProgress: 0,
        sentenceProgress: 0,
        speakingProgress: 0,

        overallProgress,
      },
      update: {
        grammarProgress,
        overallProgress,
      },
    });

  return {
    submission,

    correct: isCorrect,
    score,

    correctAnswer: question.answer,
    explanation: question.explanation,

    progress: {
      grammarProgress,
      overallProgress:
        chapterProgress.overallProgress,
    },
  };
};