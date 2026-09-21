import { Router } from "express";
// achievement route
import {authenticate,} from "../../../../middlewares/auth.middleware";

import {getUserAchievementsController,} from "../../controller/achievement/achievement.controller";

const router = Router();

router.get("/",authenticate,getUserAchievementsController);

export default router;