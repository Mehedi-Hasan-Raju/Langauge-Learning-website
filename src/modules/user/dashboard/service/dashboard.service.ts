import { prisma } from "../../../../lib/prisma";

import {
  getActivePremiumSubscription,
} from "../../../subscription/service/subscription.service";

const skills = [
  "GRAMMAR",
  "SCHREIBEN",
  "LISTENING",
  "VOCABULARY",
  "SENTENCE_BUILDING",
  "SPRECHEN",
] as const;

export const getUserDashboard = async (userId: string) => {
  // ==========================================
  // 1. User + Profile
  // ==========================================

  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,

      userProfile: {
        select: {
          avatar: true,
          currentLevel: true,
          targetLevel: true,
          currentStreak: true,
          longestStreak: true,
          lastActiveDate: true,
          totalStudyMinutes: true,
        },
      },
    },
  });

  if (!user) {
    throw new Error("USER_NOT_FOUND");
  }

  // ==========================================
  // 2. Skill Progress
  // ==========================================

  const skillProgresses = await prisma.skillProgress.findMany({
    where: {
      userId,
    },
  });

  const skillProgress = skills.map((skill) => {
    const progress = skillProgresses.find(
      (item) => item.skill === skill
    );

    const completedTasks = progress?.completedTasks ?? 0;
    const totalTasks = progress?.totalTasks ?? 0;

    const completionPercentage =
      totalTasks > 0
        ? Number(
            ((completedTasks / totalTasks) * 100).toFixed(2)
          )
        : 0;

    return {
      skill,
      completedTasks,
      totalTasks,
      completionPercentage,
      currentScore: progress?.currentScore ?? 0,
      previousScore: progress?.previousScore ?? 0,
      totalStudyMinutes:
        progress?.totalStudyMinutes ?? 0,
    };
  });

  // ==========================================
  // 3. Overall Progress
  // ==========================================

  const totalCompletedTasks = skillProgress.reduce(
    (sum, skill) => sum + skill.completedTasks,
    0
  );

  const totalTasks = skillProgress.reduce(
    (sum, skill) => sum + skill.totalTasks,
    0
  );

  const overallProgress =
    totalTasks > 0
      ? Number(
          ((totalCompletedTasks / totalTasks) * 100).toFixed(2)
        )
      : 0;

  // ==========================================
  // 4. Recent Activities
  // ==========================================

  const recentActivities =
    await prisma.activityRecord.findMany({
      where: {
        userId,
      },
      orderBy: {
        completedAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        skill: true,
        activityType: true,
        referenceId: true,
        score: true,
        durationMinutes: true,
        completedAt: true,
      },
    });

  // ==========================================
  // 5. Last 7 Daily Activities
  // ==========================================

  const dailyActivities =
    await prisma.dailyActivity.findMany({
      where: {
        userId,
      },
      orderBy: {
        date: "desc",
      },
      take: 7,
      select: {
        id: true,
        date: true,
        completedTasks: true,
        studyMinutes: true,
        grammarCompleted: true,
        schreibenCompleted: true,
        listeningCompleted: true,
        vocabularyCompleted: true,
        sentenceCompleted: true,
        sprechenCompleted: true,
      },
    });

  const last7DaysStats = dailyActivities.reduce(
    (acc, day) => {
      acc.completedTasks += day.completedTasks;
      acc.studyMinutes += day.studyMinutes;

      acc.grammarCompleted += day.grammarCompleted;
      acc.schreibenCompleted += day.schreibenCompleted;
      acc.listeningCompleted += day.listeningCompleted;
      acc.vocabularyCompleted += day.vocabularyCompleted;
      acc.sentenceCompleted += day.sentenceCompleted;
      acc.sprechenCompleted += day.sprechenCompleted;

      return acc;
    },
    {
      completedTasks: 0,
      studyMinutes: 0,
      grammarCompleted: 0,
      schreibenCompleted: 0,
      listeningCompleted: 0,
      vocabularyCompleted: 0,
      sentenceCompleted: 0,
      sprechenCompleted: 0,
    }
  );

  // ==========================================
  // 6. Achievements
  // ==========================================

  const achievements = await prisma.userAchievement.findMany({
    where: {
      userId,
    },
    orderBy: {
      unlockedAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      achievementKey: true,
      unlockedAt: true,
    },
  });

  // ==========================================
  // 7. Premium Status
  // ==========================================

  const premiumSubscription =
    await getActivePremiumSubscription(userId);

  const isPremium = !!premiumSubscription;

  // ==========================================
  // 8. Dashboard Response
  // ==========================================

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
    },

    profile: {
      avatar: user.userProfile?.avatar ?? null,
      currentLevel:
        user.userProfile?.currentLevel ?? null,
      targetLevel:
        user.userProfile?.targetLevel ?? null,
      currentStreak:
        user.userProfile?.currentStreak ?? 0,
      longestStreak:
        user.userProfile?.longestStreak ?? 0,
      lastActiveDate:
        user.userProfile?.lastActiveDate ?? null,
      totalStudyMinutes:
        user.userProfile?.totalStudyMinutes ?? 0,
    },

    progress: {
      completedTasks: totalCompletedTasks,
      totalTasks,
      overallProgress,
      skills: skillProgress,
    },

    subscription: {
      isPremium,
      endDate: premiumSubscription?.endDate ?? null,
    },

    studyStats: {
      last7Days: last7DaysStats,
    },

    recentActivities,

    dailyActivities,

    achievements,
  };
};