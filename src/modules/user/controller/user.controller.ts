import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";
import {
    getMyProfile,
    updateMyProfile,
} from "../service/user.service";

export const getProfile = async (
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

        const user = await getMyProfile(req.user.userId);

        return res.status(200).json({
            success: true,
            message: "Profile retrieved successfully",
            user,
        });
    } catch (error: any) {
        return res.status(404).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to retrieve profile",
        });
    }
};

export const updateProfile = async (
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

        const user = await updateMyProfile(
            req.user.userId,
            req.body
        );

        return res.status(200).json({
            success: true,
            message: "Profile updated successfully",
            user,
        });
    } catch (error: any) {
        return res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Failed to update profile",
        });
    }
};