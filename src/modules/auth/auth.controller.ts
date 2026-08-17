import {Request, Response } from 'express';
import {registerUser,loginUser, getCurrentUser,} from './auth.service';
import { AuthRequest } from "../../middlewares/auth.middleware";


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
        const user = await registerUser(req.body);
        res.status(201).json({
            success: true,
            message: "Registration Successful",
            user,
        });
    }catch (error: any) {
        res.status(400).json({
            success: false,
            message: error instanceof Error ? error.message: "Registration Failed",
        });
    }
};

export const login = async (
  req: Request,
  res: Response
) => {
  try {
    const { email, password } = req.body;

    const result = await loginUser(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
      ...result,
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Login failed",
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


