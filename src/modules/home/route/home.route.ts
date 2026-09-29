import { Router } from "express";

import {
  getHomeDataController,
} from "../controller/home.controller";

const router = Router();

router.get("/", getHomeDataController);

export default router;