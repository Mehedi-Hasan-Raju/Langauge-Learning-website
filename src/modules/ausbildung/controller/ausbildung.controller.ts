import { Request, Response } from "express";
import { imageUpload,} from "../../../lib/upload";

import {uploadAusbildungImage,} from "../../../lib/cloudinary-image";

import {
  createAusbildung,
  getAusbildungen,
  getAusbildungById,
  updateAusbildung,
  deleteAusbildung,
  createApplicationDocument,
  getApplicationDocuments,
  updateApplicationDocument,
  deleteApplicationDocument,
  createVisaDocument,
  getVisaDocuments,
  updateVisaDocument,
  deleteVisaDocument,
} from "../service/ausbildung.service";

export const createAusbildungController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const {
        name,
        shortDescription,
      } = req.body;

      if (
        !name ||
        !shortDescription
      ) {
        return res.status(400).json({
          success: false,
          message:
            "name and shortDescription are required",
        });
      }
      
      let imageUrl: string | undefined;

      if (req.file) {
        const uploadedImage =
          await uploadAusbildungImage(
            req.file.buffer
          );

        imageUrl =
          uploadedImage.secure_url;
      }
       
      const ausbildung =
        await createAusbildung({
          name,
          shortDescription,
          imageUrl,
        });

      return res.status(201).json({
        success: true,
        message:
          "Ausbildung created successfully",
        ausbildung,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create Ausbildung",
      });
    }
  };

export const getAusbildungenController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const ausbildungen =
        await getAusbildungen();

      return res.status(200).json({
        success: true,
        ausbildungen,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch Ausbildungen",
      });
    }
  };

export const getAusbildungByIdController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid Ausbildung id",
        });
      }

      const ausbildung =
        await getAusbildungById(id);

      return res.status(200).json({
        success: true,
        ausbildung,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Ausbildung not found",
      });
    }
  };

  export const updateAusbildungController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid Ausbildung id",
        });
      }

      const ausbildung =
        await updateAusbildung(
          id,
            {
            name: req.body.name,
            shortDescription:
              req.body.shortDescription,
            imageBuffer:
              req.file?.buffer,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Ausbildung updated successfully",
        ausbildung,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update Ausbildung",
      });
    }
  };

  export const deleteAusbildungController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid Ausbildung id",
        });
      }

      await deleteAusbildung(id);

      return res.status(200).json({
        success: true,
        message:
          "Ausbildung deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete Ausbildung",
      });
    }
  };

  //application 

export const createApplicationDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { ausbildungId } = req.params;

      const {
        title,
        description,
        required,
        order,
      } = req.body;

      if (
        typeof ausbildungId !== "string" ||
        !ausbildungId ||
        !title
      ) {
        return res.status(400).json({
          success: false,
          message:
            "ausbildungId and title are required",
        });
      }

      const document =
        await createApplicationDocument({
          ausbildungId,
          title: title.trim(),

          description:
            typeof description === "string"
              ? description.trim()
              : undefined,

          required:
            required !== undefined
              ? Boolean(required)
              : true,

          order:
            order !== undefined
              ? Number(order)
              : 0,
        });

      return res.status(201).json({
        success: true,
        message:
          "Application document created successfully",
        document,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create application document",
      });
    }
  };;

export const getApplicationDocumentsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { ausbildungId } =
        req.params;

      if (
        typeof ausbildungId !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Ausbildung id",
        });
      }

      const documents =
        await getApplicationDocuments(
          ausbildungId
        );

      return res.status(200).json({
        success: true,
        documents,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch documents",
      });
    }
  };

  export const updateApplicationDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid document id",
        });
      }

      const document =
        await updateApplicationDocument(
          id,
          {
            title: req.body.title,
            description:
              req.body.description,
            required:
              req.body.required,
            order:
              req.body.order !== undefined
                ? Number(req.body.order)
                : undefined,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Application document updated successfully",
        document,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update document",
      });
    }
  };

  export const deleteApplicationDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid document id",
        });
      }

      await deleteApplicationDocument(id);

      return res.status(200).json({
        success: true,
        message:
          "Application document deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete document",
      });
    }
  };

  // visa

  export const createVisaDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { ausbildungId } = req.params;

      const {
        title,
        description,
        required,
        order,
      } = req.body;

      if (
        typeof ausbildungId !== "string" ||
        !ausbildungId ||
        !title
      ) {
        return res.status(400).json({
          success: false,
          message:
            "ausbildungId and title are required",
        });
      }
      const document =
        await createVisaDocument({
          ausbildungId,
          title: title.trim(),
          description:
            typeof description === "string"
              ? description.trim()
              : undefined,
     
          required: required !== undefined
              ? Boolean(required)
              : true,
          order:
            order !== undefined
              ? Number(order)
              : 0,
        });

      return res.status(201).json({
        success: true,
        message:
          "Visa document created successfully",
        document,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create visa document",
      });
    }
  };

  export const getVisaDocumentsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { ausbildungId } =
        req.params;

      if (
        typeof ausbildungId !==
        "string"
      ) {
        return res.status(400).json({
          success: false,
          message:
            "Invalid Ausbildung id",
        });
      }

      const documents =
        await getVisaDocuments(
          ausbildungId
        );

      return res.status(200).json({
        success: true,
        documents,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch visa documents",
      });
    }
  };

  export const updateVisaDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid document id",
        });
      }

      const document =
        await updateVisaDocument(
          id,
          {
            title: req.body.title,
            description:
              req.body.description,
            required:
              req.body.required,
            order:
              req.body.order !== undefined
                ? Number(req.body.order)
                : undefined,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Visa document updated successfully",
        document,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update visa document",
      });
    }
  };

  export const deleteVisaDocumentController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid document id",
        });
      }

      await deleteVisaDocument(id);

      return res.status(200).json({
        success: true,
        message:
          "Visa document deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete visa document",
      });
    }
  };

  