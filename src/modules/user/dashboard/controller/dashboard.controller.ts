import { Response } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

import {
  getUserDashboard,
} from "../service/dashboard.service";

export const getUserDashboardController = async (
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

    const dashboard = await getUserDashboard(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error("Get dashboard error:", error);

    if (
      error instanceof Error &&
      error.message === "USER_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to get dashboard data",
    });
  }
};