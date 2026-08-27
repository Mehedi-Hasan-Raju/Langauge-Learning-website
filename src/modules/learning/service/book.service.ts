import { prisma } from "../../../lib/prisma";

export const createBook = async (
  name: string,
  author: string | undefined,
  levelId: string
) => {
  const level = await prisma.level.findUnique({
    where: {
      id: levelId,
    },
  });

  if (!level) {
    throw new Error("Level not found");
  }

  return await prisma.book.create({
    data: {
      name,
      author,
      levelId,
    },
  });
};

export const getBooksByLevel = async (levelId: string) => {
  const level = await prisma.level.findUnique({
    where: {
      id: levelId,
    },
  });

  if (!level) {
    throw new Error("Level not found");
  }

  return await prisma.book.findMany({
    where: {
      levelId,
    },
    include: {
      level: true,
      chapters: {
        orderBy: {
          chapterNo: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getBookById = async (id: string) => {
  const book = await prisma.book.findUnique({
    where: {
      id,
    },
    include: {
      level: true,
      chapters: {
        orderBy: {
          chapterNo: "asc",
        },
      },
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  return book;
};

export const updateBook = async (
  id: string,
  data: {
    name?: string;
    author?: string;
    levelId?: string;
  }
) => {
  const book = await prisma.book.findUnique({
    where: {
      id,
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  if (data.levelId !== undefined) {
    const level = await prisma.level.findUnique({
      where: {
        id: data.levelId,
      },
    });

    if (!level) {
      throw new Error("Level not found");
    }
  }

  return await prisma.book.update({
    where: {
      id,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),
      ...(data.author !== undefined && {
        author: data.author,
      }),
      ...(data.levelId !== undefined && {
        levelId: data.levelId,
      }),
    },
    include: {
      level: true,
    },
  });
};

export const deleteBook = async (id: string) => {
  const book = await prisma.book.findUnique({
    where: {
      id,
    },
  });

  if (!book) {
    throw new Error("Book not found");
  }

  return await prisma.book.delete({
    where: {
      id,
    },
  });
};