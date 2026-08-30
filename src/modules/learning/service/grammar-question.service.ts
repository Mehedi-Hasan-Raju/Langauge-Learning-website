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

  const submission = await prisma.grammarSubmission.create({
    data: {
      userId,
      questionId,
      userAnswer: userAnswer.trim(),
      isCorrect,
      score,
    },
  });

  return {
    submission,
    correct: isCorrect,
    score,
    correctAnswer: question.answer,
    explanation: question.explanation,
  };
};