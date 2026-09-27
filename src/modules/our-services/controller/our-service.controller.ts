import { Request, Response } from "express";
import {
  createService,
  getAllServices,
  getServiceById,
  updateService,
  deleteService,
} from "../service/our-service.service";
import { AuthRequest } from "../../../middlewares/auth.middleware";

const parseBoolean = (
  value: unknown,
  defaultValue?: boolean
): boolean | undefined => {
  if (value === undefined) return defaultValue;

  if (value === true || value === "true") return true;
  if (value === false || value === "false") return false;

  return defaultValue;
};

const parseOrder = (value: unknown): number | undefined => {
  if (value === undefined || value === "") return undefined;

  const parsed = Number(value);

  return Number.isNaN(parsed) ? undefined : parsed;
};

export const createServiceController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      title,
      shortDescription,
      description,
      type,
      examName,
    } = req.body;

    if (!title || !shortDescription || !description) {
      return res.status(400).json({
        success: false,
        message:
          "Title, shortDescription and description are required",
      });
    }

    if (type !== undefined && type !== "GENERAL" && type !== "EXAM") {
      return res.status(400).json({
        success: false,
        message: "Type must be GENERAL or EXAM",
      });
    }

    if (type === "EXAM" && !examName) {
      return res.status(400).json({
        success: false,
        message: "examName is required for EXAM service",
      });
    }

    const service = await createService({
      title,
      shortDescription,
      description,
      type,
      examName,
      order: parseOrder(req.body.order),
      active: parseBoolean(req.body.active, true),
      image: req.file?.buffer,
    });

    return res.status(201).json({
      success: true,
      message: "Our service created successfully",
      data: service,
    });
  } catch (error) {
    console.error("Create service error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create our service",
    });
  }
};

export const getAllServicesController = async (
  req: Request,
  res: Response
) => {
  try {
    const services = await getAllServices(false);

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Get services error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get our services",
    });
  }
};

export const getServiceByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = Array.isArray(req.params.id)
      ? req.params.id[0]
      : req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const service = await getServiceById(id, false);

    if (!service) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: service,
    });
  } catch (error) {
    console.error("Get service error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get service",
    });
  }
};

export const getAllServicesAdminController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const services = await getAllServices(true);

    return res.status(200).json({
      success: true,
      data: services,
    });
  } catch (error) {
    console.error("Get admin services error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get services",
    });
  }
};

export const updateServiceController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    const {
      title,
      shortDescription,
      description,
      type,
      examName,
    } = req.body;

    if (type !== undefined && type !== "GENERAL" && type !== "EXAM") {
      return res.status(400).json({
        success: false,
        message: "Type must be GENERAL or EXAM",
      });
    }

    const service = await updateService(id as string, {
      title,
      shortDescription,
      description,
      type,
      examName,
      order: parseOrder(req.body.order),
      active: parseBoolean(req.body.active),
      image: req.file?.buffer,
    });

    return res.status(200).json({
      success: true,
      message: "Our service updated successfully",
      data: service,
    });
  } catch (error) {
    console.error("Update service error:", error);

    if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update service",
    });
  }
};

export const deleteServiceController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Service ID is required",
      });
    }

    await deleteService(id as string);

    return res.status(200).json({
      success: true,
      message: "Our service deleted successfully",
    });
  } catch (error) {
    console.error("Delete service error:", error);

    if (error instanceof Error && error.message === "SERVICE_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete service",
    });
  }
};