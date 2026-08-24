import { Router } from "express";
import { authenticate } from "../../../middlewares/auth.middleware";
import {
    getProfile,
    updateProfile,
} from "../controller/user.controller";
import {
    startStudy,
    endStudy,
} from "../controller/study.controller";


const router = Router();

router.get(
    "/profile",
    authenticate,
    getProfile
);

router.patch(
    "/profile",
    authenticate,
    updateProfile
);

router.post(
    "/study/start",
    authenticate,
    startStudy
);

router.post(
    "/study/end/:sessionId",
    authenticate,
    endStudy
);

export default router;