import app from "./app";
import { env } from "./config/env";
import { prisma } from "./lib/prisma";
import authRoutes from "./modules/auth/auth.routes";
import userRoutes from "./modules/user/route/user.route";
const startServer = async () => {
  try {
    await prisma.$connect();

    console.log("Database connected successfully");

    const userCount = await prisma.user.count();

    console.log(`Total users: ${userCount}`);

    app.listen(env.PORT, () => {
      console.log(
        `Server running on http://localhost:${env.PORT}`
      );
    });
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};


app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
startServer();