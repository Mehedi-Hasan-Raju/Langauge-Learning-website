import { prisma } from "../../../lib/prisma";

type AccessType = "FREE" | "PREMIUM";

export const createChapter = async (
  title: string,
  chapterNo: number,
  sectionNo: number,
  accessType: AccessType,
  bookId: string
) => {
  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  const existingChapter = await prisma.chapter.findUnique({
    where: {
      bookId_chapterNo_sectionNo: {
        bookId,
        chapterNo,
        sectionNo,
      },
    },
  });

  if (existingChapter) {
    throw new Error(
      "Chapter with this number and section already exists"
    );
  }

  return await prisma.chapter.create({
    data: {
      title,
      chapterNo,
      sectionNo,
      accessType,
      bookId,
    },
  });
};

export const getChaptersByBook = async (
  bookId: string
) => {
  const book = await prisma.book.findUnique({
    where: {
      id: bookId,
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  return await prisma.chapter.findMany({
    where: {
      bookId,
    },
    orderBy: [
      {
        chapterNo: "asc",
      },
      {
        sectionNo: "asc",
      },
    ],
  });
};

export const getChapterById = async (
  id: string
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id,
    },
    include: {
      book: {
        include: {
          level: true,
        },
      },
      vocabularies: true,
      grammarTopics: {
        include: {
          questions: true,
        },
      },
      sentenceExercises: true,
      writingTasks: true,
      listeningExercises: {
        include: {
          tasks: true,
        },
      },
      speakingPractices: true,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return chapter;
};

export const updateChapter = async (
  id: string,
  data: {
    title?: string;
    chapterNo?: number;
    sectionNo?: number;
    accessType?: AccessType;
  }
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  const newChapterNo =
    data.chapterNo ?? chapter.chapterNo;

  const newSectionNo =
    data.sectionNo ?? chapter.sectionNo;

  const duplicate = await prisma.chapter.findFirst({
    where: {
      bookId: chapter.bookId,
      chapterNo: newChapterNo,
      sectionNo: newSectionNo,
      NOT: {
        id,
      },
    },
  });

  if (duplicate) {
    throw new Error(
      "Chapter with this number and section already exists"
    );
  }

  return await prisma.chapter.update({
    where: {
      id,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title,
      }),
      ...(data.chapterNo !== undefined && {
        chapterNo: data.chapterNo,
      }),
      ...(data.sectionNo !== undefined && {
        sectionNo: data.sectionNo,
      }),
      ...(data.accessType !== undefined && {
        accessType: data.accessType,
      }),
    },
  });
};

export const deleteChapter = async (
  id: string
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.chapter.delete({
    where: {
      id,
    },
  });
};