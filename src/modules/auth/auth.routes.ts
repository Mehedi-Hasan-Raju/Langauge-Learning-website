import { Router } from "express";
import { login, 
         register,
         verifyEmailController,
         forgotPasswordController,
         resetPasswordController,
         googleAuth,
         googleCallback,
         getMe,
         adminTest, } from "./auth.controller";


import { authenticate,
         authorizeAdmin } from "../../middlewares/auth.middleware";


const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me",authenticate, getMe);
router.get("/admin",authenticate,authorizeAdmin, adminTest);
router.post("/verifyEmail", verifyEmailController);
router.post("/forgotPassword", forgotPasswordController);
router.post("/resetPassword", resetPasswordController);
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback);



export default router;