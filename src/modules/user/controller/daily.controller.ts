import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import {recordDailyActivity,} from "../service/daily.service";

export const completeDailyActivity = async (
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

        const allowedSkills = [
            "GRAMMAR",
            "SCHREIBEN",
            "LISTENING",
            "VOCABULARY",
            "SENTENCE_BUILDING",
            "SPRECHEN",
        ];

        if (!skill || !allowedSkills.includes(skill)) {
            return res.status(400).json({
                success: false,
                message: "Invalid learning skill",
            });
        }

        const result = await recordDailyActivity(
            req.user.userId,
            skill
        );

        return res.status(200).json({
            success: true,
            message: "Daily activity recorded successfully",
            data: result,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to record daily activity",
        });
    }
};