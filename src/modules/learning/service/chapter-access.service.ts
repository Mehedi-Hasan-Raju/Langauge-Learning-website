import { prisma } from "../../../lib/prisma";

type UserRole = "USER" | "ADMIN";

export const checkChapterAccess = async (
  chapterId: string,
  userId: string,
  userRole: UserRole
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
    include: {
      book: true,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  // Admin can access everything
  if (userRole === "ADMIN") {
    return {
      allowed: true,
      chapter,
    };
  }

  // Premium chapter → active subscription required
  if (chapter.accessType === "PREMIUM") {
    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
    });

    if (!subscription) {
      return {
        allowed: false,
        reason: "PREMIUM_REQUIRED",
      };
    }
  }

  // First chapter is always available
  if (chapter.chapterNo === 1) {
    return {
      allowed: true,
      chapter,
    };
  }

  // Find previous logical chapter
  // Example:
  // Current = Chapter 2
  // Previous = Chapter 1.1 if it exists
  const previousMainChapter = await prisma.chapter.findFirst({
    where: {
      bookId: chapter.bookId,
      chapterNo: chapter.chapterNo - 1,
      sectionNo: {
        gt: 0,
      },
    },
    orderBy: {
      sectionNo: "desc",
    },
  });

  let requiredChapterId = previousMainChapter?.id;

  // If previous chapter has no section (1.1), use Chapter 1
  if (!requiredChapterId) {
    const previousChapter = await prisma.chapter.findFirst({
      where: {
        bookId: chapter.bookId,
        chapterNo: chapter.chapterNo - 1,
      },
      orderBy: {
        sectionNo: "desc",
      },
    });

    requiredChapterId = previousChapter?.id;
  }

  if (!requiredChapterId) {
    throw new Error("Previous chapter not found");
  }

  // Check previous chapter progress
  const previousProgress =
    await prisma.userProgress.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId: requiredChapterId,
        },
      },
    });

  if (
    !previousProgress ||
    previousProgress.overallProgress < 80
  ) {
    return {
      allowed: false,
      reason: "PREVIOUS_CHAPTER_INCOMPLETE",
    };
  }

  return {
    allowed: true,
    chapter,
  };
};