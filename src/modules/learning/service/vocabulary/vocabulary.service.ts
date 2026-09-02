import { prisma } from "../../../../lib/prisma";
import { generateGermanSpeech } from "../../../../lib/text-to-speech";

type VocabularyData = {
  germanWord: string;
  englishMeaning: string;
  article?: string;
  plural?: string;
  audioUrl?: string;
  chapterId: string;
};

export const createVocabulary = async (
  data: VocabularyData
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.vocabulary.create({
    data: {
      germanWord: data.germanWord,
      englishMeaning: data.englishMeaning,
      article: data.article,
      plural: data.plural,
      audioUrl: data.audioUrl,
      chapterId: data.chapterId,
    },
  });
};

export const getVocabularyByChapter = async (
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

  return await prisma.vocabulary.findMany({
    where: {
      chapterId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getVocabularyById = async (
  id: string
) => {
  const vocabulary = await prisma.vocabulary.findUnique({
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
      exercises: true,
    },
  });

  if (!vocabulary) {
    throw new Error("Vocabulary not found");
  }

  return vocabulary;
};

export const updateVocabulary = async (
  id: string,
  data: {
    germanWord?: string;
    englishMeaning?: string;
    article?: string;
    plural?: string;
    audioUrl?: string;
  }
) => {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: {
      id,
    },
  });

  if (!vocabulary) {
    throw new Error("Vocabulary not found");
  }

  return await prisma.vocabulary.update({
    where: {
      id,
    },
    data: {
      ...(data.germanWord !== undefined && {
        germanWord: data.germanWord,
      }),
      ...(data.englishMeaning !== undefined && {
        englishMeaning: data.englishMeaning,
      }),
      ...(data.article !== undefined && {
        article: data.article,
      }),
      ...(data.plural !== undefined && {
        plural: data.plural,
      }),
      ...(data.audioUrl !== undefined && {
        audioUrl: data.audioUrl,
      }),
    },
  });
};

export const deleteVocabulary = async (
  id: string
) => {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: {
      id,
    },
  });

  if (!vocabulary) {
    throw new Error("Vocabulary not found");
  }

  return await prisma.vocabulary.delete({
    where: {
      id,
    },
  });
};