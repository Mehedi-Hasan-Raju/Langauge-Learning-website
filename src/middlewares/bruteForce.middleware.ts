import { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";

export const bruteForceProtection = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const email =
            typeof req.body?.email === "string"
                ? req.body.email.trim().toLowerCase()
                : "";

        if (!email) {
            return next();
        }

        const attempt = await prisma.loginAttempt.findUnique({
            where: {
                email,
            },
        });

        if (
            attempt?.lockedUntil &&
            attempt.lockedUntil > new Date()
        ) {
            const remainingMinutes = Math.ceil(
                (attempt.lockedUntil.getTime() - Date.now()) /
                    (1000 * 60)
            );

            return res.status(429).json({
                success: false,
                message: `Too many failed login attempts. Try again in ${remainingMinutes} minute(s).`,
            });
        }

        // Automatically clear expired lock
        if (
            attempt?.lockedUntil &&
            attempt.lockedUntil <= new Date()
        ) {
            await prisma.loginAttempt.update({
                where: {
                    email,
                },
                data: {
                    failedAttempts: 0,
                    lockedUntil: null,
                },
            });
        }

        next();
    } catch (error) {
        console.error(
            "Brute force protection error:",
            error
        );

        next();
    }
};


export const recordFailedLogin = async (
    email: string
) => {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await prisma.loginAttempt.findUnique({
        where: {
            email: normalizedEmail,
        },
    });

    const failedAttempts =
        (existing?.failedAttempts ?? 0) + 1;

    // Lock after 5 failed attempts
    if (failedAttempts >= 5) {
        const lockedUntil = new Date(
            Date.now() + 15 * 60 * 1000
        );

        await prisma.loginAttempt.upsert({
            where: {
                email: normalizedEmail,
            },
            update: {
                failedAttempts,
                lockedUntil,
                lastAttemptAt: new Date(),
            },
            create: {
                email: normalizedEmail,
                failedAttempts,
                lockedUntil,
                lastAttemptAt: new Date(),
            },
        });

        return;
    }

    await prisma.loginAttempt.upsert({
        where: {
            email: normalizedEmail,
        },
        update: {
            failedAttempts,
            lastAttemptAt: new Date(),
        },
        create: {
            email: normalizedEmail,
            failedAttempts,
            lastAttemptAt: new Date(),
        },
    });
};


export const clearFailedLogins = async (
    email: string
) => {
    const normalizedEmail = email.trim().toLowerCase();

    await prisma.loginAttempt.deleteMany({
        where: {
            email: normalizedEmail,
        },
    });
};