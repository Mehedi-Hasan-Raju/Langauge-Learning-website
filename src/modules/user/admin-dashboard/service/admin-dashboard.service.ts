import { prisma } from "../../../../lib/prisma";

export const getAdminDashboard = async () => {
  // ==========================================
  // 1. Basic Counts
  // ==========================================

  const [
    totalUsers,
    verifiedUsers,
    totalLevels,
    totalBooks,
    totalChapters,
    totalBlogs,
    publishedBlogs,
    totalAusbildungen,
    totalServices,
    totalMembers,
  ] = await Promise.all([
    prisma.user.count(),

    prisma.user.count({
      where: {
        emailVerified: true,
      },
    }),

    prisma.level.count(),
    prisma.book.count(),
    prisma.chapter.count(),
    prisma.blog.count(),

    prisma.blog.count({
      where: {
        published: true,
      },
    }),

    prisma.ausbildung.count(),
    prisma.ourService.count(),
    prisma.ourMember.count(),
  ]);

  // ==========================================
  // 2. User Roles
  // ==========================================

  const adminUsers = await prisma.user.count({
    where: {
      role: "ADMIN",
    },
  });

  const normalUsers = await prisma.user.count({
    where: {
      role: "USER",
    },
  });

  // ==========================================
  // 3. Premium / Subscription
  // ==========================================

  const activeSubscriptions =
    await prisma.subscription.count({
      where: {
        status: "ACTIVE",
        endDate: {
          gt: new Date(),
        },
      },
    });

  const expiredSubscriptions =
    await prisma.subscription.count({
      where: {
        status: "EXPIRED",
      },
    });

  const cancelledSubscriptions =
    await prisma.subscription.count({
      where: {
        status: "CANCELLED",
      },
    });

  // ==========================================
  // 4. Payment Summary
  // ==========================================

  const [
    totalPayments,
    completedPayments,
    pendingPayments,
    failedPayments,
    refundedPayments,
  ] = await Promise.all([
    prisma.payment.count(),

    prisma.payment.count({
      where: {
        status: "COMPLETED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        status: "FAILED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "REFUNDED",
      },
    }),
  ]);

  // ==========================================
  // 5. Recent Users
  // ==========================================

  const recentUsers = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      emailVerified: true,
      createdAt: true,

      userProfile: {
        select: {
          currentLevel: true,
          targetLevel: true,
          avatar: true,
        },
      },
    },
  });

  // ==========================================
  // 6. Recent Payments
  // ==========================================

  const recentPayments = await prisma.payment.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
    select: {
      id: true,
      amount: true,
      currency: true,
      status: true,
      provider: true,
      paymentMethod: true,
      transactionId: true,
      paidAt: true,
      createdAt: true,

      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  // ==========================================
  // 7. Recent Subscriptions
  // ==========================================

  const recentSubscriptions =
    await prisma.subscription.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        plan: true,
        amount: true,
        currency: true,
        status: true,
        startDate: true,
        endDate: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

  // ==========================================
  // 8. Dashboard Response
  // ==========================================

  return {
    users: {
      total: totalUsers,
      verified: verifiedUsers,
      admins: adminUsers,
      normalUsers,
    },

    learning: {
      levels: totalLevels,
      books: totalBooks,
      chapters: totalChapters,
    },

    content: {
      blogs: {
        total: totalBlogs,
        published: publishedBlogs,
      },

      ausbildungen: totalAusbildungen,
      services: totalServices,
      members: totalMembers,
    },

    subscriptions: {
      active: activeSubscriptions,
      expired: expiredSubscriptions,
      cancelled: cancelledSubscriptions,
    },

    payments: {
      total: totalPayments,
      completed: completedPayments,
      pending: pendingPayments,
      failed: failedPayments,
      refunded: refundedPayments,
    },

    recentUsers,
    recentPayments,
    recentSubscriptions,
  };
};