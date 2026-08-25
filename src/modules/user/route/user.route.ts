import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import { getProfile,updateProfile,} from "../controller/user.controller";
import {startStudy, endStudy, getStudyStats,} from "../controller/study.controller";
import {completeDailyActivity,} from "../controller/daily.controller";


const router = Router();

router.get( "/profile",authenticate, getProfile);

router.patch( "/profile", authenticate, updateProfile);

router.post( "/study/start",authenticate, startStudy);

router.post( "/study/end/:sessionId", authenticate, endStudy);

router.get("/study/statistics", authenticate, getStudyStats);

router.post( "/activity/complete",authenticate, completeDailyActivity);


export default router;