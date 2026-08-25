import {prisma} from "../../../lib/prisma";

export const startStudySession = async (
    userId: string,
    skill?: "GRAMMAR" | "SCHREIBEN" | "LISTENING" | "VOCABULARY" | "SENTENCE_BUILDING" | "SPRECHEN"
) => {
    const activeSession = await prisma.studySession.findFirst({
        where: {
            userId,
            endedAt: null,
        },
    });

    if (activeSession) {
        throw new Error("You already have an active study session");
    }

    const session = await prisma.studySession.create({
        data: {
            userId,
            skill,
            startedAt: new Date(),
        },
    });

    return session;
};

export const endStudySession = async (
    userId: string,
    sessionId: string
) => {
    const session = await prisma.studySession.findFirst({
        where: {
            id: sessionId,
            userId,
            endedAt: null,
        },
    });

    if (!session) {
        throw new Error("Active study session not found");
    }

    const endedAt = new Date();

    const durationMinutes = Math.max(
        1,
        Math.round(
            (endedAt.getTime() - session.startedAt.getTime()) /
                (1000 * 60)
        )
    );

    const updatedSession = await prisma.studySession.update({
        where: {
            id: sessionId,
        },
        data: {
            endedAt,
            durationMinutes,
        },
    });

 await prisma.userProfile.upsert({
    where: {
        userId,
    },
    create: {
        userId,
        totalStudyMinutes: durationMinutes,
    },
    update: {
        totalStudyMinutes: {
            increment: durationMinutes,
        },
    },
});
    return updatedSession;
};


export const getStudyStatistics = async (
    userId: string
) => {
    const now = new Date();

    // Start of today
    const startOfToday = new Date(now);
    startOfToday.setHours(0, 0, 0, 0);

    // Start of week - Sunday
    const startOfWeek = new Date(startOfToday);
    startOfWeek.setDate(
        startOfWeek.getDate() - startOfWeek.getDay()
    );

    // Start of month
    const startOfMonth = new Date(
        now.getFullYear(),
        now.getMonth(),
        1
    );

    // Get completed study sessions
    const sessions = await prisma.studySession.findMany({
        where: {
            userId,
            endedAt: {
                not: null,
            },
        },
        select: {
            skill: true,
            durationMinutes: true,
            startedAt: true,
            endedAt: true,
        },
    });

    let todayMinutes = 0;
    let weekMinutes = 0;
    let monthMinutes = 0;
    let totalMinutes = 0;

    const skillWise: Record<string, number> = {
        GRAMMAR: 0,
        SCHREIBEN: 0,
        LISTENING: 0,
        VOCABULARY: 0,
        SENTENCE_BUILDING: 0,
        SPRECHEN: 0,
    };

    for (const session of sessions) {
        const duration = session.durationMinutes || 0;

        totalMinutes += duration;

        if (session.startedAt >= startOfToday) {
            todayMinutes += duration;
        }

        if (session.startedAt >= startOfWeek) {
            weekMinutes += duration;
        }

        if (session.startedAt >= startOfMonth) {
            monthMinutes += duration;
        }

        if (session.skill) {
            skillWise[session.skill] =
                (skillWise[session.skill] || 0) + duration;
        }
    }

    return {
        todayMinutes,
        weekMinutes,
        monthMinutes,
        totalMinutes,
        skillWise,
    };
};