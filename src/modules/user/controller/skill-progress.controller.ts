import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import { getMySkillProgress,} from "../service/skill-progress.service";

export const getMySkillProgressController = async (
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

        const progress = await getMySkillProgress(
            req.user.userId
        );

        return res.status(200).json({
            success: true,
            message: "Skill progress fetched successfully",
            data: progress,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch skill progress",
        });
    }
};