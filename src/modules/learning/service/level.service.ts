import { prisma } from "../../../lib/prisma";

export const createLevel = async (
  name: string,
  order: number
) => {
  const existingLevel = await prisma.level.findFirst({
    where: {
      OR: [
        { name },
        { order },
      ],
    },
  });

  if (existingLevel) {
    throw new Error("Level name or order already exists");
  }

  return await prisma.level.create({
    data: {
      name,
      order,
    },
  });
};

export const getAllLevels = async () => {
  return await prisma.level.findMany({
    orderBy: {
      order: "asc",
    },
    include: {
      books: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });
};

export const getLevelById = async (id: string) => {
  const level = await prisma.level.findUnique({
    where: { id },
    include: {
      books: {
        orderBy: {
          createdAt: "asc",
        },
      },
    },
  });

  if (!level) {
    throw new Error("Level not found");
  }

  return level;
};

export const updateLevel = async (
  id: string,
  data: {
    name?: string;
    order?: number;
  }
) => {
  const level = await prisma.level.findUnique({
    where: { id },
  });

  if (!level) {
    throw new Error("Level not found");
  }

  if (data.name !== undefined || data.order !== undefined) {
    const duplicate = await prisma.level.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(data.name !== undefined
                ? [{ name: data.name }]
                : []),
              ...(data.order !== undefined
                ? [{ order: data.order }]
                : []),
            ],
          },
        ],
      },
    });

    if (duplicate) {
      throw new Error("Level name or order already exists");
    }
  }

  return await prisma.level.update({
    where: { id },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),
      ...(data.order !== undefined && {
        order: data.order,
      }),
    },
  });
};

export const deleteLevel = async (id: string) => {
  const level = await prisma.level.findUnique({
    where: { id },
  });

  if (!level) {
    throw new Error("Level not found");
  }

  return await prisma.level.delete({
    where: { id },
  });
};