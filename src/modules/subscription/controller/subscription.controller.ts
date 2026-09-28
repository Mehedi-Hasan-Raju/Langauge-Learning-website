import { Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";

import {
  getUserSubscription,
  getActivePremiumSubscription,
  cancelSubscription,
} from "../service/subscription.service";

export const getMySubscriptionController = async (
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

    const subscription = await getUserSubscription(
      req.user.userId
    );

    return res.status(200).json({
      success: true,
      data: subscription,
    });
  } catch (error) {
    console.error("Get subscription error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get subscription",
    });
  }
};

export const getMySubscriptionStatusController = async (
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

    const subscription =
      await getActivePremiumSubscription(req.user.userId);

    if (!subscription) {
      return res.status(200).json({
        success: true,
        data: {
          isPremium: false,
          subscription: null,
        },
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        isPremium: true,
        subscription,
      },
    });
  } catch (error) {
    console.error("Subscription status error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get subscription status",
    });
  }
};

export const cancelSubscriptionController = async (
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

    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Subscription ID is required",
      });
    }

    await cancelSubscription(req.user.userId, id as string);

    return res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Cancel subscription error:", error);

    if (
      error instanceof Error &&
      error.message === "SUBSCRIPTION_NOT_FOUND"
    ) {
      return res.status(404).json({
        success: false,
        message: "Subscription not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to cancel subscription",
    });
  }
};
