import { Router } from "express";
import { login, 
         register,
         verifyEmailController,
         resendVerification,
         forgotPasswordController,
         resetPasswordController,
         googleAuth,
         googleCallback,
         getMe,
         adminTest, } from "./auth.controller";


import { authenticate,
         authorizeAdmin } from "../../middlewares/auth.middleware";
import { authRateLimiter } from "../../middlewares/rateLimit.middleware";
import {
    bruteForceProtection,
} from "../../middlewares/bruteForce.middleware";
const router = Router();

router.post("/register", authRateLimiter, register);
router.post("/login", authRateLimiter,bruteForceProtection, login);
router.get("/me",authenticate, getMe);
router.get("/admin",authenticate,authorizeAdmin, adminTest);
router.post("/verifyEmail", authRateLimiter, verifyEmailController);
router.post("/resend-verification",resendVerification);
router.post("/forgotPassword", authRateLimiter, forgotPasswordController);
router.post("/resetPassword",authRateLimiter, resetPasswordController);
router.get("/google", authRateLimiter, googleAuth);
router.get("/google/callback",  googleCallback);



export default router;