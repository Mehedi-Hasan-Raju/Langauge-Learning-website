import express from "express";
import cors from "cors";
import helmet from "helmet";

const app = express();

// ==========================================
// Security Headers
// ==========================================
app.use(helmet());

// ==========================================
// CORS
// ==========================================
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

// ==========================================
// Body Parser
// ==========================================
// Prevent extremely large JSON payloads
app.use(express.json({ limit: "1mb" }));

app.use(express.urlencoded({ extended: true, limit: "1mb" }));

// ==========================================
// Health Check
// ==========================================
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "German Learning Backend is running",
  });
});

export default app;