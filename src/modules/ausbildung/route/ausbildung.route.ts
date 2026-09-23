import { Router } from "express";

import {
  authenticate,
  authorizeAdmin,
} from "../../../middlewares/auth.middleware";

import {
  createAusbildungController,
  getAusbildungenController,
  getAusbildungByIdController,
  updateAusbildungController,
  deleteAusbildungController,

  createApplicationDocumentController,
  getApplicationDocumentsController,
  updateApplicationDocumentController,
  deleteApplicationDocumentController,

  createVisaDocumentController,
  getVisaDocumentsController,
  updateVisaDocumentController,
  deleteVisaDocumentController,
} from "../controller/ausbildung.controller";

const router = Router();

// ==========================================
// Ausbildung
// ==========================================

router.post(
  "/",
  authenticate,
  authorizeAdmin,
  createAusbildungController
);

router.get(
  "/",
  getAusbildungenController
);

router.get(
  "/:id",
  getAusbildungByIdController
);

router.patch(
  "/:id",
  authenticate,
  authorizeAdmin,
  updateAusbildungController
);

router.delete(
  "/:id",
  authenticate,
  authorizeAdmin,
  deleteAusbildungController
);

// ==========================================
// Application Documents
// ==========================================

router.post(
  "/:ausbildungId/application-documents",
  authenticate,
  authorizeAdmin,
  createApplicationDocumentController
);

router.get(
  "/:ausbildungId/application-documents",
  getApplicationDocumentsController
);

router.patch(
  "/application-documents/:id",
  authenticate,
  authorizeAdmin,
  updateApplicationDocumentController
);

router.delete(
  "/application-documents/:id",
  authenticate,
  authorizeAdmin,
  deleteApplicationDocumentController
);

// ==========================================
// Visa Documents
// ==========================================

router.post(
  "/:ausbildungId/visa-documents",
  authenticate,
  authorizeAdmin,
  createVisaDocumentController
);

router.get(
  "/:ausbildungId/visa-documents",
  getVisaDocumentsController
);

router.patch(
  "/visa-documents/:id",
  authenticate,
  authorizeAdmin,
  updateVisaDocumentController
);

router.delete(
  "/visa-documents/:id",
  authenticate,
  authorizeAdmin,
  deleteVisaDocumentController
);

export default router;