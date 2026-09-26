import { prisma } from "../../../lib/prisma";

interface CreateCategoryData {
  title: string;
  description?: string;
  order?: number;
}

interface UpdateCategoryData {
  title?: string;
  description?: string;
  order?: number;
}

interface CreateItemData {
  title: string;
  description?: string;
  required?: boolean;
  order?: number;
}

interface UpdateItemData {
  title?: string;
  description?: string;
  required?: boolean;
  order?: number;
}

// =========================
// CATEGORY
// =========================

export const createCategory = async (data: CreateCategoryData) => {
  return prisma.visaChecklistCategory.create({
    data: {
      title: data.title,
      description: data.description,
      order: data.order ?? 0,
    },
    include: {
      items: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

export const getAllCategories = async () => {
  return prisma.visaChecklistCategory.findMany({
    orderBy: {
      order: "asc",
    },
    include: {
      items: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

export const getCategoryById = async (id: string) => {
  return prisma.visaChecklistCategory.findUnique({
    where: { id },
    include: {
      items: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

export const updateCategory = async (
  id: string,
  data: UpdateCategoryData
) => {
  return prisma.visaChecklistCategory.update({
    where: { id },
    data,
    include: {
      items: {
        orderBy: {
          order: "asc",
        },
      },
    },
  });
};

export const deleteCategory = async (id: string) => {
  return prisma.visaChecklistCategory.delete({
    where: { id },
  });
};

// =========================
// ITEM
// =========================

export const createItem = async (
  categoryId: string,
  data: CreateItemData
) => {
  return prisma.visaChecklistItem.create({
    data: {
      title: data.title,
      description: data.description,
      required: data.required ?? true,
      order: data.order ?? 0,
      categoryId,
    },
  });
};

export const getItemsByCategory = async (categoryId: string) => {
  return prisma.visaChecklistItem.findMany({
    where: {
      categoryId,
    },
    orderBy: {
      order: "asc",
    },
  });
};

export const updateItem = async (
  id: string,
  data: UpdateItemData
) => {
  return prisma.visaChecklistItem.update({
    where: { id },
    data,
  });
};

export const deleteItem = async (id: string) => {
  return prisma.visaChecklistItem.delete({
    where: { id },
  });
};