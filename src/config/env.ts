// import "dotenv/config";

// const PORT = Number(process.env.PORT) || 5000;

// const JWT_SECRET = process.env.JWT_SECRET;

// if (!JWT_SECRET) {
//   throw new Error("JWT_SECRET is missing in .env");
// }



import "dotenv/config";

const requiredEnv = [
  "DATABASE_URL",
  "JWT_SECRET",
  "GEMINI_API_KEY",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
];

const missingEnv = requiredEnv.filter((key) => !process.env[key]);

if (missingEnv.length > 0) {
  console.error("Missing required environment variables:");
  missingEnv.forEach((key) => {
    console.error(`- ${key}`);
  });

  process.exit(1);
}

export const env = {
  PORT: Number(process.env.PORT) || 5000,

  DATABASE_URL: process.env.DATABASE_URL!,

  JWT_SECRET: process.env.JWT_SECRET!,

  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",

  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME!,

  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY!,

  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET!,

  NODE_ENV: process.env.NODE_ENV || "development",
};
