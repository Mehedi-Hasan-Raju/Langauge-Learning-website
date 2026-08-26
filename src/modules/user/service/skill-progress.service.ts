import { prisma } from "../../../lib/prisma";


type LearningSkill =
    | "GRAMMAR"
    | "SCHREIBEN"
    | "LISTENING"
    | "VOCABULARY"
    | "SENTENCE_BUILDING"
    | "SPRECHEN";

const ALL_SKILLS: LearningSkill[] = [
    "GRAMMAR",
    "SCHREIBEN",
    "LISTENING",
    "VOCABULARY",
    "SENTENCE_BUILDING",
    "SPRECHEN",
];

export const getMySkillProgress = async (userId: string) => {
    // Get existing progress records
    const existingProgress = await prisma.skillProgress.findMany({
        where: {
            userId,
        },
        orderBy: {
            skill: "asc",
        },
    });

    // Create missing skill records
    const existingSkills = new Set(
        existingProgress.map((item) => item.skill)
    );

    const missingSkills = ALL_SKILLS.filter(
        (skill) => !existingSkills.has(skill)
    );

    if (missingSkills.length > 0) {
        await prisma.skillProgress.createMany({
            data: missingSkills.map((skill) => ({
                userId,
                skill,
            })),
            skipDuplicates: true,
        });
    }

    // Get all progress records again
    const progress = await prisma.skillProgress.findMany({
        where: {
            userId,
        },
        orderBy: {
            skill: "asc",
        },
    });

    // Calculate overall progress
    const totalCompletedTasks = progress.reduce(
        (sum, item) => sum + item.completedTasks,
        0
    );

    const totalTasks = progress.reduce(
        (sum, item) => sum + item.totalTasks,
        0
    );

    const overallProgress =
        totalTasks > 0
            ? Number(
                  (
                      (totalCompletedTasks / totalTasks) *
                      100
                  ).toFixed(2)
              )
            : 0;

    return {
        progress,
        overallProgress,
    };
};