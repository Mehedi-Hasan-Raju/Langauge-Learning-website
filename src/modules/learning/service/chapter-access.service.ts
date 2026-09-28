import { prisma } from "../../../lib/prisma";
import {
  getActivePremiumSubscription,
} from "../../subscription/service/subscription.service";

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

  // ==========================================
  // Admin can access everything
  // ==========================================
  if (userRole === "ADMIN") {
    return {
      allowed: true,
      chapter,
    };
  }

  // ==========================================
  // Chapter 1 is always available
  // Chapter 1.1 is also part of Chapter 1
  // ==========================================
  if (chapter.chapterNo === 1) {
    return {
      allowed: true,
      chapter,
    };
  }

  // ==========================================
  // Premium chapter → active subscription required
  // ==========================================
  if (chapter.accessType === "PREMIUM") {
    const premiumSubscription =
      await getActivePremiumSubscription(userId);

    const isPremium = !!premiumSubscription;

    if (!isPremium) {
      return {
        allowed: false,
        reason: "PREMIUM_REQUIRED",
      };
    }
  }

  // ==========================================
  // Find previous logical chapter
  //
  // Example:
  // Current = Chapter 2
  // Previous logical chapter = Chapter 1.1
  // if Chapter 1.1 exists
  // ==========================================

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

  // ==========================================
  // If previous section doesn't exist,
  // use the previous main chapter
  //
  // Example:
  // Current = Chapter 2
  // No Chapter 1.1
  // → use Chapter 1
  // ==========================================

  if (!requiredChapterId) {
    const previousChapter = await prisma.chapter.findFirst({
      where: {
        bookId: chapter.bookId,
        chapterNo: chapter.chapterNo - 1,
        sectionNo: 0,
      },
    });

    requiredChapterId = previousChapter?.id;
  }

  if (!requiredChapterId) {
    throw new Error("Previous chapter not found");
  }

  // ==========================================
  // Check previous chapter progress
  // ==========================================

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

  // ==========================================
  // Access granted
  // ==========================================

  return {
    allowed: true,
    chapter,
  };
};