import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import { imageUpload } from "../../../lib/upload";

import {
  createServiceController,
  getAllServicesController,
  getServiceByIdController,
  getAllServicesAdminController,
  updateServiceController,
  deleteServiceController,
} from "../controller/our-service.controller";

const router = Router();

// Public
router.get("/", getAllServicesController);

// Admin
router.get(
  "/admin/all",
  authenticate,
  authorizeAdmin,
  getAllServicesAdminController
);

router.get("/:id", getServiceByIdController);

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  imageUpload.single("image"),
  createServiceController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  imageUpload.single("image"),
  updateServiceController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteServiceController
);

export default router;