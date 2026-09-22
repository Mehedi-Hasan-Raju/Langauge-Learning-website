import { prisma } from "../../../../lib/prisma";

export const ACHIEVEMENTS = {
  FIRST_LESSON: {
    key: "FIRST_LESSON",
    title: "First Lesson",
    description: "Complete your first learning task.",
  },

  FIRST_GRAMMAR: {
    key: "FIRST_GRAMMAR",
    title: "Grammar Starter",
    description: "Complete your first Grammar task.",
  },

  FIRST_VOCABULARY: {
    key: "FIRST_VOCABULARY",
    title: "Word Collector",
    description:
      "Complete your first Vocabulary task.",
  },

  FIRST_LISTENING: {
    key: "FIRST_LISTENING",
    title: "Good Listener",
    description:
      "Complete your first Listening task.",
  },

  FIRST_WRITING: {
    key: "FIRST_WRITING",
    title: "First Writer",
    description:
      "Complete your first Schreiben task.",
  },

  FIRST_SENTENCE: {
    key: "FIRST_SENTENCE",
    title: "Sentence Builder",
    description:
      "Complete your first Sentence Building task.",
  },

  FIRST_SPEAKING: {
    key: "FIRST_SPEAKING",
    title: "First Speaker",
    description:
      "Complete your first Speaking practice.",
  },

  TEN_TASKS: {
    key: "10_TASKS",
    title: "Getting Started",
    description:
      "Complete 10 learning tasks.",
  },

  FIFTY_TASKS: {
    key: "50_TASKS",
    title: "Dedicated Learner",
    description:
      "Complete 50 learning tasks.",
  },

  SEVEN_DAY_STREAK: {
    key: "7_DAY_STREAK",
    title: "7 Day Streak",
    description:
      "Maintain a 7-day learning streak.",
  },

  FIFTEEN_DAY_STREAK: {
    key: "15_DAY_STREAK",
    title: "15 Day Streak",
    description:
      "Maintain a 15-day learning streak.",
  },

} as const;

export const unlockAchievement = async (
  userId: string,
  achievementKey: string
) => {
  const existing =
    await prisma.userAchievement.findUnique({
      where: {
        userId_achievementKey: {
          userId,
          achievementKey,
        },
      },
    });

  if (existing) {
    return existing;
  }

  return await prisma.userAchievement.create({
    data: {
      userId,
      achievementKey,
    },
  });
};

export const checkTaskAchievements = async (
  userId: string,
  skill: string
) => {
  // ------------------------------------------
  // Get learning activity records
  // ------------------------------------------

  const activities =
    await prisma.activityRecord.findMany({
      where: {
        userId,
        referenceId: {
          not: null,
        },
      },
      select: {
        skill: true,
        referenceId: true,
      },
    });

  // ------------------------------------------
  // Count unique completed learning tasks
  // ------------------------------------------

  const uniqueTasks = new Set<string>();

  for (const activity of activities) {
    if (!activity.referenceId) {
      continue;
    }

    uniqueTasks.add(
      `${activity.skill}:${activity.referenceId}`
    );
  }

  const totalUniqueTasks =
    uniqueTasks.size;

  // ------------------------------------------
  // FIRST LESSON
  // ------------------------------------------

  if (totalUniqueTasks >= 1) {
    await unlockAchievement(
      userId,
      ACHIEVEMENTS.FIRST_LESSON.key
    );
  }

  // ------------------------------------------
  // FIRST SKILL ACHIEVEMENTS
  // ------------------------------------------

  const skillAchievementMap: Record<
    string,
    string | undefined
  > = {
    GRAMMAR:
      ACHIEVEMENTS.FIRST_GRAMMAR.key,

    VOCABULARY:
      ACHIEVEMENTS.FIRST_VOCABULARY.key,

    LISTENING:
      ACHIEVEMENTS.FIRST_LISTENING.key,

    SCHREIBEN:
      ACHIEVEMENTS.FIRST_WRITING.key,

    SENTENCE_BUILDING:
      ACHIEVEMENTS.FIRST_SENTENCE.key,

    SPRECHEN:
      ACHIEVEMENTS.FIRST_SPEAKING.key,
  };

  const skillAchievement =
    skillAchievementMap[skill];

  if (skillAchievement) {
    const uniqueSkillTasks =
      new Set<string>();

    for (const activity of activities) {
      if (
        activity.skill === skill &&
        activity.referenceId
      ) {
        uniqueSkillTasks.add(
          activity.referenceId
        );
      }
    }

    if (uniqueSkillTasks.size >= 1) {
      await unlockAchievement(
        userId,
        skillAchievement
      );
    }
  }

  // ------------------------------------------
  // 10 UNIQUE TASKS
  // ------------------------------------------

  if (totalUniqueTasks >= 10) {
    await unlockAchievement(
      userId,
      ACHIEVEMENTS.TEN_TASKS.key
    );
  }

  // ------------------------------------------
  // 50 UNIQUE TASKS
  // ------------------------------------------

  if (totalUniqueTasks >= 50) {
    await unlockAchievement(
      userId,
      ACHIEVEMENTS.FIFTY_TASKS.key
    );
  }

  // ------------------------------------------
  // Return achievements
  // ------------------------------------------

  return await prisma.userAchievement.findMany({
    where: {
      userId,
    },
    orderBy: {
      unlockedAt: "desc",
    },
  });
};

export const checkStreakAchievements =
  async (userId: string) => {
    const profile =
      await prisma.userProfile.findUnique({
        where: {
          userId,
        },
      });

    if (!profile) {
      return;
    }

    if (profile.currentStreak >= 7) {
      await unlockAchievement(
        userId,
        ACHIEVEMENTS.SEVEN_DAY_STREAK.key
      );
    }
  };


  export const getUserAchievements = async (
  userId: string
) => {
  const unlocked =
    await prisma.userAchievement.findMany({
      where: {
        userId,
      },
      orderBy: {
        unlockedAt: "desc",
      },
    });

  const unlockedKeys = new Set(
    unlocked.map(
      (item) => item.achievementKey
    )
  );

  return Object.values(
    ACHIEVEMENTS
  ).map((achievement) => ({
    key: achievement.key,
    title: achievement.title,
    description:
      achievement.description,

    unlocked:
      unlockedKeys.has(achievement.key),

    unlockedAt:
      unlocked.find(
        (item) =>
          item.achievementKey ===
          achievement.key
      )?.unlockedAt ?? null,
  }));
};