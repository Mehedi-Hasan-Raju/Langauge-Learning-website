import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import { imageUpload } from "../../../lib/upload";

import {
  createMemberController,
  getAllMembersController,
  getMemberByIdController,
  getAllMembersAdminController,
  updateMemberController,
  deleteMemberController,
} from "../controller/our-member.controller";

const router = Router();

// Public
router.get("/", getAllMembersController);

router.get("/admin/all", authenticate, authorizeAdmin, getAllMembersAdminController);

router.get("/:id", getMemberByIdController);

// Admin
router.post(
  "/",
  authenticate,
  authorizeAdmin,
  imageUpload.single("image"),
  createMemberController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  imageUpload.single("image"),
  updateMemberController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteMemberController
);

export default router;