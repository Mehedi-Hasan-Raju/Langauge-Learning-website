import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import {imageUpload,} from "../../../lib/upload";

import {
  createBlogController,
  getPublishedBlogsController,
  getAllBlogsController,
  getBlogBySlugController,
  updateBlogController,
  deleteBlogController,
  likeBlogController,
  unlikeBlogController,
  getBlogLikeStatusController,
} from "../controller/blog.controller";

const router = Router();

// Public
router.get(
  "/",
  getPublishedBlogsController
);

router.get(
  "/slug/:slug",
  getBlogBySlugController
);

// Admin
router.get(
  "/admin/all",
  authenticate,
  authorizeAdmin,
  getAllBlogsController
);

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  imageUpload.single("image"),
  createBlogController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  imageUpload.single("image"),
  updateBlogController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteBlogController
);
//like count

router.post(
  "/:id/like",
  authenticate,
  likeBlogController
);

router.delete(
  "/:id/like",
  authenticate,
  unlikeBlogController
);

router.get(
  "/:id/like-status",
  authenticate,
  getBlogLikeStatusController
);
export default router;