import { prisma } from "../../../lib/prisma";

export const getHomeData = async () => {
  const [
    services,
    members,
    ausbildungen,
    blogs,
    levels,
  ] = await Promise.all([
    // ==========================================
    // Our Services
    // ==========================================
    prisma.ourService.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
      take: 6,
      select: {
        id: true,
        title: true,
        shortDescription: true,
        description: true,
        imageUrl: true,
        type: true,
        examName: true,
        order: true,
      },
    }),

    // ==========================================
    // Our Members
    // ==========================================
    prisma.ourMember.findMany({
      where: {
        active: true,
      },
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        language: true,
        role: true,
        shortDescription: true,
        imageUrl: true,
        order: true,
      },
    }),

    // ==========================================
    // Ausbildung
    // ==========================================
    prisma.ausbildung.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        shortDescription: true,
        imageUrl: true,
      },
      take: 6,
    }),

    // ==========================================
    // Latest Published Blogs
    // ==========================================
    prisma.blog.findMany({
      where: {
        published: true,
      },
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      take: 6,
      select: {
        id: true,
        title: true,
        slug: true,
        shortDescription: true,
        coverImage: true,
        category: true,
        tags: true,
        publishedAt: true,

        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    }),

    // ==========================================
    // Learning Levels + Books
    // ==========================================
    prisma.level.findMany({
      orderBy: {
        order: "asc",
      },
      select: {
        id: true,
        name: true,
        order: true,

        books: {
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            name: true,
            author: true,
          },
        },
      },
    }),
  ]);

  return {
    services,
    members,
    ausbildungen,
    blogs,
    levels,
  };
};