import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";

import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/route/user.route";

import levelRoutes from "./modules/learning/route/level.route";
import bookRoutes from "./modules/learning/route/book.route";
import chapterRoutes from "./modules/learning/route/chapter.route";

import grammarRoutes from "./modules/learning/route/grammer/grammar.route";
import vocabularyRoutes from "./modules/learning/route/vocabulary/vocabulary.route";
import listeningRoutes from "./modules/learning/route/listening/listening.route";
import writingRoutes from "./modules/learning/route/writing/writing.route";
import sentenceRoutes from "./modules/learning/route/sentence/sentence.route";
import speakingRoutes from "./modules/learning/route/speaking/speaking.route";

import achievementRoutes from "./modules/learning/route/achievement/achievement.route";

import ausbildungRoutes from "./modules/ausbildung/route/ausbildung.route";
import blogRoutes from "./modules/blog/route/blog.route";
import visaChecklistRoutes from "./modules/visa-checklist/route/visa-checklist.route";

import ourServiceRoutes from "./modules/our-services/route/our-service.route";
import ourMemberRoutes from "./modules/our-services/route/our-member.route";

import subscriptionRoutes from "./modules/subscription/route/subscription.route";

import dashboardRoutes from "./modules/user/dashboard/route/dashboard.route";
import adminDashboardRoutes from "./modules/user/admin-dashboard/route/admin-dashboard.route";

import homeRoutes from "./modules/home/route/home.route";

import {
  notFoundHandler,
  globalErrorHandler,
} from "./middlewares/error.middleware";

// ==========================================
// Global variables
// ==========================================

let server: ReturnType<typeof app.listen>;

// Prevent shutdown from running multiple times
let isShuttingDown = false;

// ==========================================
// Start Server
// ==========================================

const startServer = async () => {
  try {
    // Connect database
    await prisma.$connect();

    console.log("Database connected successfully");

    // Check database
    const userCount = await prisma.user.count();

    console.log(`Total users: ${userCount}`);

    // Start HTTP server
    server = app.listen(env.PORT, () => {
      console.log(`Server running on http://localhost:${env.PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);

    await prisma.$disconnect();

    process.exit(1);
  }
};

// ==========================================
// Routes
// ==========================================

app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);

app.use("/api/learning/levels", levelRoutes);
app.use("/api/learning/books", bookRoutes);
app.use("/api/learning/chapters", chapterRoutes);

app.use("/api/learning/grammar", grammarRoutes);
app.use("/api/learning/vocabulary", vocabularyRoutes);
app.use("/api/learning/listening", listeningRoutes);
app.use("/api/learning/writing", writingRoutes);
app.use("/api/learning/sentence", sentenceRoutes);
app.use("/api/learning/speaking", speakingRoutes);

app.use("/api/user/achievements", achievementRoutes);

app.use("/api/ausbildung", ausbildungRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/visa-checklist", visaChecklistRoutes);

app.use("/api/our-services", ourServiceRoutes);
app.use("/api/our-members", ourMemberRoutes);

app.use("/api/subscriptions", subscriptionRoutes);

app.use("/api/user/dashboard", dashboardRoutes);
app.use("/api/admin/dashboard", adminDashboardRoutes);

app.use("/api/home", homeRoutes);

// ==========================================
// Error Handling
// ==========================================

// Must be AFTER all routes
app.use(notFoundHandler);
app.use(globalErrorHandler);

// ==========================================
// Graceful Shutdown
// ==========================================

const gracefulShutdown = async (signal: string) => {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;

  console.log(`${signal} received. Shutting down gracefully...`);

  try {
    // Stop accepting new requests
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => {
          console.log("HTTP server closed");
          resolve();
        });
      });
    }

    // Disconnect database
    await prisma.$disconnect();

    console.log("Database disconnected");
    console.log("Graceful shutdown completed");

    process.exit(0);
  } catch (error) {
    console.error("Error during graceful shutdown:", error);

    try {
      await prisma.$disconnect();
    } catch {
      // Ignore disconnect error
    }

    process.exit(1);
  }
};

// ==========================================
// Crash Protection
// ==========================================

// Uncaught synchronous exception
process.on("uncaughtException", (error) => {
  console.error("UNCAUGHT EXCEPTION:", error);

  gracefulShutdown("uncaughtException");
});

// Unhandled Promise rejection
process.on("unhandledRejection", (reason) => {
  console.error("UNHANDLED REJECTION:", reason);

  gracefulShutdown("unhandledRejection");
});

// ==========================================
// OS Shutdown Signals
// ==========================================

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM");
});

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT");
});

// ==========================================
// Start
// ==========================================

startServer();