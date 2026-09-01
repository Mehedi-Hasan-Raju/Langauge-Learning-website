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
};

export const createGrammarQuestion = async (
  data: GrammarQuestionData
) => {
  const topic = await prisma.grammarTopic.findUnique({
    where: {
      id: data.grammarId,
    },
  });

  if (!topic) {
    throw new Error("Grammar topic not found");
  }

  const existing = await prisma.grammarQuestion.findFirst({
    where: {
      grammarId: data.grammarId,
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

  if (data.taskNo !== undefined) {
    const duplicate =
      await prisma.grammarQuestion.findFirst({
        where: {
          grammarId: question.grammarId,
          taskNo: data.taskNo,
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
      grammar: {
        select: {
          chapterId: true,
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
        grammar: {
          chapterId: question.grammar.chapterId,
        },
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
          grammar: {
            chapterId: question.grammar.chapterId,
          },
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
          grammar: {
            chapterId: question.grammar.chapterId,
          },
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
          chapterId: question.grammar.chapterId,
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
          chapterId: question.grammar.chapterId,
        },
      },
      create: {
        userId,
        chapterId: question.grammar.chapterId,

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