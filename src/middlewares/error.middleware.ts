import {
  Request,
  Response,
  NextFunction,
  ErrorRequestHandler,
} from "express";

import multer from "multer";

import { Prisma } from "../generated/client";

// ==========================================
// Custom Application Error
// ==========================================
export class AppError extends Error {
  statusCode: number;
  status: string;
  isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);

    this.statusCode = statusCode;
    this.status = statusCode < 500 ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// ==========================================
// 404 - Route Not Found
// ==========================================
export const notFoundHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(
    new AppError(
      `Route not found: ${req.method} ${req.originalUrl}`,
      404
    )
  );
};

// ==========================================
// Global Error Handler
// ==========================================
export const globalErrorHandler: ErrorRequestHandler = (
  err,
  req,
  res,
  next
) => {
  // Server console-e full error dekhabe
  console.error("ERROR:", err);

  // Response already sent hole Express-er default
  // error handler-er kache pass kore dibo
  if (res.headersSent) {
    return next(err);
  }

  let statusCode = 500;
  let message = "Internal server error";

  // ==========================================
  // 1. Custom App Error
  // ==========================================
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  }

  // ==========================================
  // 2. Prisma Validation Error
  // ==========================================
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Invalid data provided";
  }

  // ==========================================
  // 3. Prisma Known Request Error
  // ==========================================
  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      // Duplicate unique field
      // Example: duplicate email
      case "P2002":
        statusCode = 409;
        message = "A record with this value already exists";
        break;

      // Record not found
      case "P2025":
        statusCode = 404;
        message = "Requested record was not found";
        break;

      // Foreign key constraint failed
      case "P2003":
        statusCode = 400;
        message = "Related record does not exist";
        break;

      // Required relation violation
      case "P2014":
        statusCode = 400;
        message =
          "The requested change violates a required relation";
        break;

      // Inconsistent column data / invalid ID
      case "P2023":
        statusCode = 400;
        message = "Invalid ID or malformed data";
        break;

      // Other known Prisma errors
      default:
        statusCode = 400;
        message = "Database request failed";
        break;
    }
  }

  // ==========================================
  // 4. Multer / File Upload Error
  // ==========================================
  else if (err instanceof multer.MulterError) {
    statusCode = 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size is too large";
    } else {
      message = `File upload error: ${err.message}`;
    }
  }

  // ==========================================
  // 5. Normal JavaScript Error
  // ==========================================
  else if (err instanceof Error) {
    statusCode = 500;
    message = err.message;
  }

  // ==========================================
  // Environment
  // ==========================================
  const isProduction = process.env.NODE_ENV === "production";

  // ==========================================
  // Final Response
  // ==========================================
  res.status(statusCode).json({
    success: false,
    status: statusCode < 500 ? "fail" : "error",
    message,

    // Development-e stack dekhabe
    // Production-e stack hide thakbe
    ...(isProduction
      ? {}
      : err instanceof Error
      ? { stack: err.stack }
      : {}),
  });
};