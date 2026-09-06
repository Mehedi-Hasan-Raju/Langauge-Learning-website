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