import { prisma } from "../../../../lib/prisma";


type GrammarTopicData = {
  title: string;
  explanation: string;
  examples?: string[];
  rules?: string[];
  commonMistakes?: string[];
  videoUrl?: string;
  chapterId: string;
};

export const createGrammarTopic = async (
  data: GrammarTopicData
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.grammarTopic.create({
    data: {
      title: data.title,
      explanation: data.explanation,
      examples: data.examples,
      rules: data.rules,
      commonMistakes: data.commonMistakes,
      videoUrl: data.videoUrl,
      chapterId: data.chapterId,
    },
  });
};

export const getGrammarTopicsByChapter = async (
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

  return await prisma.grammarTopic.findMany({
    where: {
      chapterId,
    },
    include: {
      questions: {
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

export const getGrammarTopicById = async (
  id: string
) => {
  const topic = await prisma.grammarTopic.findUnique({
    where: {
      id,
    },
    include: {
      chapter: true,
      questions: {
        orderBy: {
          taskNo: "asc",
        },
      },
    },
  });

  if (!topic) {
    throw new Error("Grammar topic not found");
  }

  return topic;
};

export const updateGrammarTopic = async (
  id: string,
  data: Partial<Omit<GrammarTopicData, "chapterId">>
) => {
  const topic = await prisma.grammarTopic.findUnique({
    where: {
      id,
    },
  });

  if (!topic) {
    throw new Error("Grammar topic not found");
  }

  return await prisma.grammarTopic.update({
    where: {
      id,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),
      ...(data.explanation !== undefined && {
        explanation: data.explanation,
      }),
      ...(data.examples !== undefined && {
        examples: data.examples,
      }),
      ...(data.rules !== undefined && {
        rules: data.rules,
      }),
      ...(data.commonMistakes !== undefined && {
        commonMistakes: data.commonMistakes,
      }),
      ...(data.videoUrl !== undefined && {
        videoUrl: data.videoUrl,
      }),
    },
  });
};

export const deleteGrammarTopic = async (
  id: string
) => {
  const topic = await prisma.grammarTopic.findUnique({
    where: {
      id,
    },
  });

  if (!topic) {
    throw new Error("Grammar topic not found");
  }

  return await prisma.grammarTopic.delete({
    where: {
      id,
    },
  });
};