import { z } from "zod";

export const registerSchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long"),

    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
});

export const loginSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    password: z
        .string()
        .min(1, "Password is required")
        .max(100, "Password is too long"),
});

export const verifyEmailSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    code: z
        .string()
        .trim()
        .length(6, "Verification code must be 6 digits")
        .regex(/^\d{6}$/, "Invalid verification code"),
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
    email: z
        .string()
        .trim()
        .toLowerCase()
        .email("Invalid email address"),

    code: z
        .string()
        .trim()
        .length(6, "Reset code must be 6 digits")
        .regex(/^\d{6}$/, "Invalid reset code"),

    newPassword: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .max(100, "Password is too long"),
});