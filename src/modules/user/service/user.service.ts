import {prisma} from "../../../lib/prisma";

export const getMyProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            userProfile: true,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const {
        password: _,
        ...userWithoutPassword
    } = user;

    return userWithoutPassword;
};

export const updateMyProfile = async (
    userId: string,
    data: {
        name?: string;
        avatar?: string;
        currentLevel?: string;
        targetLevel?: string;
    }
) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    if (!user) {
        throw new Error("User not found");
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: userId,
        },
        data: {
            ...(data.name !== undefined && {
                name: data.name,
            }),
            ...(data.avatar !== undefined && {
                profile: {
                    upsert: {
                        create: {
                            avatar: data.avatar,
                        },
                        update: {
                            avatar: data.avatar,
                        },
                    },
                },
            }),
        },
        include: {
            userProfile: true,
        },
    });

    if (
        data.currentLevel !== undefined ||
        data.targetLevel !== undefined
    ) {
        await prisma.userProfile.upsert({
            where: {
                userId,
            },
            create: {
                userId,
                currentLevel: data.currentLevel,
                targetLevel: data.targetLevel,
            },
            update: {
                ...(data.currentLevel !== undefined && {
                    currentLevel: data.currentLevel,
                }),
                ...(data.targetLevel !== undefined && {
                    targetLevel: data.targetLevel,
                }),
            },
        });
    }

    const finalUser = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        include: {
            userProfile: true,
        },
    });

    if (!finalUser) {
        throw new Error("User not found");
    }

    const {
        password: _password,
        ...userWithoutPassword
    } = finalUser;

    return userWithoutPassword;
};