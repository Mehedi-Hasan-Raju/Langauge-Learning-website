import { Response } from "express";
import { AuthRequest } from "../../../../middlewares/auth.middleware";

import {
  getAdminDashboard,
} from "../service/admin-dashboard.service";

export const getAdminDashboardController = async (
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

    const data = await getAdminDashboard();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get admin dashboard error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get admin dashboard",
    });
  }
};