import { Response } from "express";

import {
  AuthRequest,
} from "../../../../middlewares/auth.middleware";

import {
  getUserAchievements,
} from "../../service/achievement/achievement.service";

export const getUserAchievementsController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const achievements =
        await getUserAchievements(
          req.user.userId
        );

      return res.status(200).json({
        success: true,
        achievements,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch achievements",
      });
    }
  };