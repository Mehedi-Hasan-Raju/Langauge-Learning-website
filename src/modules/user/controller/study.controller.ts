import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import {
    startStudySession,
    endStudySession,
} from "../service/study.service";

export const startStudy = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { skill } = req.body;

        const session = await startStudySession(
            req.user.userId,
            skill
        );

        return res.status(201).json({
            success: true,
            message: "Study session started",
            session,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to start study session",
        });
    }
};

export const endStudy = async (
    req: AuthRequest,
    res: Response
) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        const { sessionId } = req.params;

        const session = await endStudySession(
            req.user.userId,
            sessionId as string                 //////////////ekhane err asce trpr es string dea rakhci//////
        );

        return res.status(200).json({
            success: true,
            message: "Study session completed",
            session,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to end study session",
        });
    }
};