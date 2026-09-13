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