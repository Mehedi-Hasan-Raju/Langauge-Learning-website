import { prisma } from "../../../../lib/prisma";

interface CreateSpeakingPracticeInput {
  title: string;
  instruction: string;
  prompt?: string;
  type:
    | "TOPIC"
    | "QUESTION"
    | "AI_CONVERSATION";
  chapterId: string;
}

export const createSpeakingPractice = async (
  data: CreateSpeakingPracticeInput
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.speakingPractice.create({
    data: {
      title: data.title.trim(),
      instruction: data.instruction.trim(),
      prompt: data.prompt?.trim(),
      type: data.type,
      chapterId: data.chapterId,
    },
  });
};

export const getSpeakingPracticesByChapter =
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

    return await prisma.speakingPractice.findMany({
      where: {
        chapterId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  };

export const getSpeakingPracticeById = async (
  id: string
) => {
  const practice =
    await prisma.speakingPractice.findUnique({
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

  if (!practice) {
    throw new Error(
      "Speaking practice not found"
    );
  }

  return practice;
};

export const updateSpeakingPractice = async (
  id: string,
  data: {
    title?: string;
    instruction?: string;
    prompt?: string | null;
    type?:
      | "TOPIC"
      | "QUESTION"
      | "AI_CONVERSATION";
  }
) => {
  const practice =
    await prisma.speakingPractice.findUnique({
      where: {
        id,
      },
    });

  if (!practice) {
    throw new Error(
      "Speaking practice not found"
    );
  }

  return await prisma.speakingPractice.update({
    where: {
      id,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title.trim(),
      }),

      ...(data.instruction !== undefined && {
        instruction:
          data.instruction.trim(),
      }),

      ...(data.prompt !== undefined && {
        prompt:
          data.prompt === null
            ? null
            : data.prompt.trim(),
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),
    },
  });
};

export const deleteSpeakingPractice = async (
  id: string
) => {
  const practice =
    await prisma.speakingPractice.findUnique({
      where: {
        id,
      },
    });

  if (!practice) {
    throw new Error(
      "Speaking practice not found"
    );
  }

  return await prisma.speakingPractice.delete({
    where: {
      id,
    },
  });
};