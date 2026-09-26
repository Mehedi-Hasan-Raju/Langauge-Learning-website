import { Request, Response } from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
  createItem,
  getItemsByCategory,
  updateItem,
  deleteItem,
} from "../service/visa-checklist.service";
import { AuthRequest } from "../../../middlewares/auth.middleware";

// =========================
// CATEGORY
// =========================

export const createCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { title, description, order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Category title is required",
      });
    }

    const category = await createCategory({
      title,
      description,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Visa checklist category created successfully",
      data: category,
    });
  } catch (error) {
    console.error("Create category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create visa checklist category",
    });
  }
};

export const getAllCategoriesController = async (
  req: Request,
  res: Response
) => {
  try {
    const categories = await getAllCategories();

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Get categories error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get visa checklist categories",
    });
  }
};

export const getCategoryByIdController = async (
  req: Request,
  res: Response
) => {
  try {
    const { id } = req.params;
    
    const category = await getCategoryById(id as string);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Visa checklist category not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: category,
    });
  } catch (error) {
    console.error("Get category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get visa checklist category",
    });
  }
};

export const updateCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    
    const { title, description, order } = req.body;

    const category = await updateCategory(id as string, {
      title,
      description,
      order,
    });

    return res.status(200).json({
      success: true,
      message: "Visa checklist category updated successfully",
      data: category,
    });
  } catch (error) {
    console.error("Update category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update visa checklist category",
    });
  }
};

export const deleteCategoryController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteCategory(id as string);

    return res.status(200).json({
      success: true,
      message: "Visa checklist category deleted successfully",
    });
  } catch (error) {
    console.error("Delete category error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete visa checklist category",
    });
  }
};

// =========================
// ITEM
// =========================

export const createItemController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { categoryId } = req.params;
    const { title, description, required, order } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Checklist item title is required",
      });
    }

    const item = await createItem(categoryId as string, {
      title,
      description,
      required,
      order,
    });

    return res.status(201).json({
      success: true,
      message: "Checklist item created successfully",
      data: item,
    });
  } catch (error) {
    console.error("Create checklist item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create checklist item",
    });
  }
};
export const getItemsByCategoryController = async (
  req: Request,
  res: Response
) => {
  try {
    const categoryId = req.params.categoryId;

    if (!categoryId) {
      return res.status(400).json({
        success: false,
        message: "Category ID is required",
      });
    }

    const items = await getItemsByCategory(categoryId as string);

    return res.status(200).json({
      success: true,
      data: items,
    });
  } catch (error) {
    console.error("Get checklist items error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get checklist items",
    });
  }
};

export const updateItemController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;
    const { title, description, required, order } = req.body;

    const item = await updateItem(id as string, {
      title,
      description,
      required,
      order,
    });

    return res.status(200).json({
      success: true,
      message: "Checklist item updated successfully",
      data: item,
    });
  } catch (error) {
    console.error("Update checklist item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update checklist item",
    });
  }
};

export const deleteItemController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    const { id } = req.params;

    await deleteItem(id as string);

    return res.status(200).json({
      success: true,
      message: "Checklist item deleted successfully",
    });
  } catch (error) {
    console.error("Delete checklist item error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete checklist item",
    });
  }
};