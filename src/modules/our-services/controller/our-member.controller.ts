import { Request, Response } from "express";
import { AuthRequest } from "../../../middlewares/auth.middleware";

import {
  createMember,
  getAllMembers,
  getMemberById,
  updateMember,
  deleteMember,
} from "../service/our-member.service";
import { string } from "zod";

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

export const createMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const {
      name,
      language,
      role,
      shortDescription,
    } = req.body;

    if (!name || !language || !shortDescription) {
      return res.status(400).json({
        success: false,
        message:
          "Name, language and shortDescription are required",
      });
    }

    const member = await createMember({
      name,
      language,
      role,
      shortDescription,
      order: parseOrder(req.body.order),
      active: parseBoolean(req.body.active, true),
      image: req.file?.buffer,
    });

    return res.status(201).json({
      success: true,
      message: "Our member created successfully",
      data: member,
    });
  } catch (error) {
    console.error("Create member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create member",
    });
  }
};

export const getAllMembersController = async (
  req: Request,
  res: Response
) => {
  try {
    const members = await getAllMembers(false);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get members",
    });
  }
};

export const getMemberByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const member = await getMemberById(id as string, false);

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: member,
    });
  } catch (error) {
    console.error("Get member error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get member",
    });
  }
};

export const getAllMembersAdminController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const members = await getAllMembers(true);

    return res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    console.error("Get admin members error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get members",
    });
  }
};

export const updateMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    const {
      name,
      language,
      role,
      shortDescription,
    } = req.body;

    const member = await updateMember(id as string, {
      name,
      language,
      role,
      shortDescription,
      order: parseOrder(req.body.order),
      active: parseBoolean(req.body.active),
      image: req.file?.buffer,
    });

    return res.status(200).json({
      success: true,
      message: "Our member updated successfully",
      data: member,
    });
  } catch (error) {
    console.error("Update member error:", error);

    if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update member",
    });
  }
};

export const deleteMemberController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const id = req.params.id;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Member ID is required",
      });
    }

    await deleteMember(id as string);

    return res.status(200).json({
      success: true,
      message: "Our member deleted successfully",
    });
  } catch (error) {
    console.error("Delete member error:", error);

    if (error instanceof Error && error.message === "MEMBER_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Member not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to delete member",
    });
  }
};