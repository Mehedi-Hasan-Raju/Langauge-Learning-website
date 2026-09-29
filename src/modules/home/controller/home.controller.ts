import { Request, Response } from "express";

import {
  getHomeData,
} from "../service/home.service";

export const getHomeDataController = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getHomeData();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get home data error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get home page data",
    });
  }
};