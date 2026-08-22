import {Request, Response } from 'express';
import {registerUser,loginUser, getCurrentUser,verifyEmail, forgotPassword,resetPassword,googleLogin,} from './auth.service';
import { AuthRequest } from "../../middlewares/auth.middleware";
import { getGoogleAuthUrl } from '../../lib/google';
import { registerSchema } from "../../validations/auth.validation";
import { loginSchema } from "../../validations/auth.validation";
import { ZodError } from "zod";

export const getMe = async (
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

    const user = await getCurrentUser(req.user.userId);

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(404).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "User not found",
    });
  }
};



export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const data = registerSchema.parse(req.body);

        const user = await registerUser(data);
        res.status(201).json({
            success: true,
            message: "Registration Successful",
            user,
        });
    }catch (error: any) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                field: issue.path[0],
                message: issue.message,
            })),
        });
    }

    return res.status(400).json({
        success: false,
        message:
            error instanceof Error
                ? error.message
                : "Registration Failed",
    });
}
};

export const verifyEmailController = async (
    req: Request,
    res: Response
) => {
    try {
        const { email, code } = req.body;

        const result = await verifyEmail(email, code);

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Email verification failed",
        });
    }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const data = loginSchema.parse(req.body);
    

    const result = await loginUser(data.email, data.password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  }catch (error: any) {
    if (error instanceof ZodError) {
        return res.status(400).json({
            success: false,
            message: "Validation failed",
            errors: error.issues.map((issue) => ({
                field: issue.path[0],
                message: issue.message,
            })),
        });
    }

    return res.status(400).json({
        success: false,
        message:
            error instanceof Error
                ? error.message
                : "Login Failed",
    });
}
}; 

export const adminTest = async (
  req: AuthRequest,
  res: Response
) => {
  res.status(200).json({
    success: true,
    message: "Welcome Admin!",
    user: req.user,
  });
};


export const forgotPasswordController = async (
    req: Request,
    res: Response
) => {
    try {
        const { email } = req.body;

        const result = await forgotPassword(email);

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Password reset request failed",
        });
    }
};


export const resetPasswordController = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            code,
            newPassword,
        } = req.body;

        const result = await resetPassword(
            email,
            code,
            newPassword
        );

        res.status(200).json({
            success: true,
            ...result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Password reset failed",
        });
    }
};


export const googleAuth = async (
    req: Request,
    res: Response
) => {
    try {
        const authUrl = getGoogleAuthUrl();

        res.redirect(authUrl);
    } catch (error: any) {
        res.status(500).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Google authentication failed",
        });
    }
};


export const googleCallback = async (
    req: Request,
    res: Response
) => {
    try {
        const { code } = req.query;

        if (!code || typeof code !== "string") {
            return res.status(400).json({
                success: false,
                message: "Google authorization code is missing",
            });
        }

        const result = await googleLogin(code);

        res.status(200).json({
            success: true,
            message: "Google login successful",
            ...result,
        });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Google login failed",
        });
    }
};

