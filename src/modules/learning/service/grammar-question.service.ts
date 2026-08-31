import { prisma } from "../../../lib/prisma";

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

  // Check if this user already answered this question
  const existingSubmission =
    await prisma.grammarSubmission.findFirst({
      where: {
        userId,
        questionId,
      },
    });

  let submission;

  if (existingSubmission) {
    // Update existing submission
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
    // Create first submission
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

  // ==============================
  // GET ALL GRAMMAR QUESTIONS
  // FOR THIS CHAPTER
  // ==============================

  const totalQuestions =
    await prisma.grammarQuestion.count({
      where: {
        grammar: {
          chapterId: question.grammar.chapterId,
        },
      },
    });

  // ==============================
  // GET USER'S ANSWERED QUESTIONS
  // ==============================

  const completedQuestions =
    await prisma.grammarSubmission.count({
      where: {
        userId,
        question: {
          grammar: {
            chapterId: question.grammar.chapterId,
          },
        },
      },
    });

  // ==============================
  // GRAMMAR COMPLETION PROGRESS
  // ==============================

  const grammarProgress =
    totalQuestions > 0
      ? Number(
          (
            (completedQuestions / totalQuestions) *
            100
          ).toFixed(2)
        )
      : 0;

  // ==============================
  // GRAMMAR ACCURACY / SCORE
  // ==============================

  const submissions =
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
        score: true,
      },
    });

  const currentScore =
    submissions.length > 0
      ? Number(
          (
            submissions.reduce(
              (sum, item) => sum + item.score,
              0
            ) / submissions.length
          ).toFixed(2)
        )
      : 0;

  // ==============================
  // UPDATE SKILL PROGRESS
  // ==============================

 const existingSkillProgress =
  await prisma.skillProgress.findUnique({
    where: {
      userId_skill: {
        userId,
        skill: "GRAMMAR",
      },
    },
  });

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

  // ==============================
  // GET / CREATE CHAPTER PROGRESS
  // ==============================

  const existingChapterProgress =
    await prisma.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId: question.grammar.chapterId,
        },
      },
    });

  const grammarChapterProgress = grammarProgress;

  // Other skills remain unchanged
  const vocabularyProgress =
    existingChapterProgress?.vocabularyProgress ?? 0;

  const listeningProgress =
    existingChapterProgress?.listeningProgress ?? 0;

  const writingProgress =
    existingChapterProgress?.writingProgress ?? 0;

  const sentenceProgress =
    existingChapterProgress?.sentenceProgress ?? 0;

  // Sprechen is intentionally excluded
  const overallProgress =
    (
      grammarChapterProgress +
      vocabularyProgress +
      listeningProgress +
      writingProgress +
      sentenceProgress
    ) / 5;

  // ==============================
  // UPDATE CHAPTER PROGRESS
  // ==============================

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
        grammarProgress: grammarChapterProgress,
        vocabularyProgress: 0,
        listeningProgress: 0,
        writingProgress: 0,
        sentenceProgress: 0,
        speakingProgress: 0,
        overallProgress: Number(
          overallProgress.toFixed(2)
        ),
      },
      update: {
        grammarProgress:
          grammarChapterProgress,
        overallProgress: Number(
          overallProgress.toFixed(2)
        ),
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