import { Router } from "express";
import {
  createCategoryController,
  getAllCategoriesController,
  getCategoryByIdController,
  updateCategoryController,
  deleteCategoryController,
  createItemController,
  getItemsByCategoryController,
  updateItemController,
  deleteItemController,
} from "../controller/visa-checklist.controller";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

const router = Router();

// =========================
// PUBLIC
// =========================

router.get("/", getAllCategoriesController);

router.get(
  "/category/:categoryId/items",
  getItemsByCategoryController
);

router.get("/:id", getCategoryByIdController);

// =========================
// ADMIN
// =========================

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createCategoryController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateCategoryController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteCategoryController
);

router.post(
  "/category/:categoryId/items",
  authenticate,
  authorizeAdmin,
  createItemController
);

router.patch(
  "/items/:id",
  authenticate,
  authorizeAdmin,
  updateItemController
);

router.delete(
  "/items/:id",
  authenticate,
  authorizeAdmin,
  deleteItemController
);

export default router;