import {prisma} from "../../../lib/prisma";

type LearningSkill =
    | "GRAMMAR"
    | "SCHREIBEN"
    | "LISTENING"
    | "VOCABULARY"
    | "SENTENCE_BUILDING"
    | "SPRECHEN";

const getStartOfDay = (date: Date) => {
    const start = new Date(date);

    start.setHours(0, 0, 0, 0);

    return start;
};

const getYesterday = (date: Date) => {
    const yesterday = new Date(date);

    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    return yesterday;
};

export const recordDailyActivity = async (
    userId: string,
    skill: LearningSkill
) => {
    const today = getStartOfDay(new Date());

    const yesterday = getYesterday(today);

    // Find today's activity
    let dailyActivity = await prisma.dailyActivity.findUnique({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
    });

    // Create today's activity if it doesn't exist
    if (!dailyActivity) {
        dailyActivity = await prisma.dailyActivity.create({
            data: {
                userId,
                date: today,
                completedTasks: 0,
            },
        });
    }

    // Update skill-specific completed task
    const skillFieldMap = {
        GRAMMAR: "grammarCompleted",
        SCHREIBEN: "schreibenCompleted",
        LISTENING: "listeningCompleted",
        VOCABULARY: "vocabularyCompleted",
        SENTENCE_BUILDING: "sentenceCompleted",
        SPRECHEN: "sprechenCompleted",
    } as const;

    const field = skillFieldMap[skill];

    const updatedActivity = await prisma.dailyActivity.update({
        where: {
            id: dailyActivity.id,
        },
        data: {
            completedTasks: {
                increment: 1,
            },
            [field]: {
                increment: 1,
            },
        },
    });

    // Get user profile
    let profile = await prisma.userProfile.findUnique({
        where: {
            userId,
        },
    });

    // Create profile if it doesn't exist
    if (!profile) {
        profile = await prisma.userProfile.create({
            data: {
                userId,
            },
        });
    }

    let currentStreak = profile.currentStreak;
    let longestStreak = profile.longestStreak;

    const lastActiveDate = profile.lastActiveDate
        ? getStartOfDay(profile.lastActiveDate)
        : null;

    // Update streak
    if (!lastActiveDate) {
        currentStreak = 1;
    } else if (
        lastActiveDate.getTime() === yesterday.getTime()
    ) {
        currentStreak += 1;
    } else if (
        lastActiveDate.getTime() !== today.getTime()
    ) {
        currentStreak = 1;
    }

    // Update longest streak
    if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
    }

    // Don't reset today's streak if user completes
    // multiple activities on the same day
    await prisma.userProfile.update({
        where: {
            userId,
        },
        data: {
            currentStreak,
            longestStreak,
            lastActiveDate: today,
        },
    });

    return {
        activity: updatedActivity,
        currentStreak,
        longestStreak,
    };
};