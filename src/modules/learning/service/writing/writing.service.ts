import { prisma } from "../../../../lib/prisma";

interface CreateWritingTaskInput {
  title: string;
  instruction: string;
  type:
    | "FILL_IN_THE_GAP"
    | "EMAIL"
    | "SHORT_MESSAGE";
  minWords?: number;
  maxWords?: number;
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