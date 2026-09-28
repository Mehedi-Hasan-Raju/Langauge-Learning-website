import {prisma} from "../../../lib/prisma";

export const getUserSubscription = async (userId: string) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
    },
    orderBy: {
      endDate: "desc",
    },
    include: {
      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return subscription;
};

export const getActivePremiumSubscription = async (
  userId: string
) => {
  const now = new Date();

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId,
      plan: "PREMIUM",
      status: "ACTIVE",
      endDate: {
        gt: now,
      },
    },
    orderBy: {
      endDate: "desc",
    },
  });

  return subscription;
};

export const createSubscription = async (
  userId: string,
  amount: number,
  currency = "BDT"
) => {
  const now = new Date();

  const endDate = new Date(now);
  endDate.setMonth(endDate.getMonth() + 1);

  return prisma.subscription.create({
    data: {
      userId,
      plan: "PREMIUM",
      amount,
      currency,
      startDate: now,
      endDate,
      status: "ACTIVE",
    },
  });
};

export const cancelSubscription = async (
  userId: string,
  subscriptionId: string
) => {
  const subscription = await prisma.subscription.findFirst({
    where: {
      id: subscriptionId,
      userId,
    },
  });

  if (!subscription) {
    throw new Error("SUBSCRIPTION_NOT_FOUND");
  }

  return prisma.subscription.update({
    where: {
      id: subscriptionId,
    },
    data: {
      status: "CANCELLED",
    },
  });
};

export const expireOldSubscriptions = async () => {
  const now = new Date();

  return prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      endDate: {
        lte: now,
      },
    },
    data: {
      status: "EXPIRED",
    },
  });
};
