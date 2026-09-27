import {prisma} from "../../../lib/prisma";
import {
  uploadImageBuffer,
  deleteCloudinaryImage,
} from "../../../lib/cloudinary-image";

type ServiceTypeValue = "GENERAL" | "EXAM";

interface CreateServiceData {
  title: string;
  shortDescription: string;
  description: string;
  type?: ServiceTypeValue;
  examName?: string;
  order?: number;
  active?: boolean;
  image?: Buffer;
}

interface UpdateServiceData {
  title?: string;
  shortDescription?: string;
  description?: string;
  type?: ServiceTypeValue;
  examName?: string | null;
  order?: number;
  active?: boolean;
  image?: Buffer;
}

export const createService = async (data: CreateServiceData) => {
  let imageUrl: string | undefined;
  let imagePublicId: string | undefined;

  if (data.image) {
    const uploaded = await uploadImageBuffer(
      data.image,
      "german-learning/services"
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;
  }

  return prisma.ourService.create({
    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      type: data.type ?? "GENERAL",
      examName:
        data.type === "EXAM"
          ? data.examName || null
          : null,
      order: data.order ?? 0,
      active: data.active ?? true,
      imageUrl,
      imagePublicId,
    },
  });
};

export const getAllServices = async (admin = false) => {
  return prisma.ourService.findMany({
    where: admin
      ? undefined
      : {
          active: true,
        },
    orderBy: {
      order: "asc",
    },
  });
};

export const getServiceById = async (
  id: string,
  admin = false
) => {
  return prisma.ourService.findFirst({
    where: {
      id,
      ...(admin ? {} : { active: true }),
    },
  });
};

export const updateService = async (
  id: string,
  data: UpdateServiceData
) => {
  const existing = await prisma.ourService.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  let imageUrl = existing.imageUrl;
  let imagePublicId = existing.imagePublicId;

  if (data.image) {
    const uploaded = await uploadImageBuffer(
      data.image,
      "german-learning/services"
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;

    await deleteCloudinaryImage(existing.imagePublicId);
  }

  let type = data.type ?? existing.type;

  return prisma.ourService.update({
    where: { id },
    data: {
      title: data.title,
      shortDescription: data.shortDescription,
      description: data.description,
      type,
      examName:
        type === "EXAM"
          ? data.examName ?? existing.examName
          : null,
      order: data.order,
      active: data.active,
      imageUrl,
      imagePublicId,
    },
  });
};

export const deleteService = async (id: string) => {
  const existing = await prisma.ourService.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("SERVICE_NOT_FOUND");
  }

  await deleteCloudinaryImage(existing.imagePublicId);

  return prisma.ourService.delete({
    where: { id },
  });
};