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