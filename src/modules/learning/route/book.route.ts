import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import {
  createBookController,
  getBooksByLevelController,
  getBookByIdController,
  updateBookController,
  deleteBookController,
} from "../controller/book.controller";

const router = Router();

// Get books under a level
router.get(
  "/level/:levelId",
  getBooksByLevelController
);

// Get single book
router.get(
  "/:id",
  getBookByIdController
);

// Admin only
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createBookController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateBookController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteBookController
);

export default router;