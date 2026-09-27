import {prisma} from "../../../lib/prisma";
import {
  uploadImageBuffer,
  deleteCloudinaryImage,
} from "../../../lib/cloudinary-image";

interface CreateMemberData {
  name: string;
  language: string;
  role?: string;
  shortDescription: string;
  order?: number;
  active?: boolean;
  image?: Buffer;
}

interface UpdateMemberData {
  name?: string;
  language?: string;
  role?: string;
  shortDescription?: string;
  order?: number;
  active?: boolean;
  image?: Buffer;
}

export const createMember = async (data: CreateMemberData) => {
  let imageUrl: string | undefined;
  let imagePublicId: string | undefined;

  if (data.image) {
    const uploaded = await uploadImageBuffer(
      data.image,
      "german-learning/members"
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;
  }

  return prisma.ourMember.create({
    data: {
      name: data.name,
      language: data.language,
      role: data.role,
      shortDescription: data.shortDescription,
      order: data.order ?? 0,
      active: data.active ?? true,
      imageUrl,
      imagePublicId,
    },
  });
};

export const getAllMembers = async (admin = false) => {
  return prisma.ourMember.findMany({
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

export const getMemberById = async (
  id: string,
  admin = false
) => {
  return prisma.ourMember.findFirst({
    where: {
      id,
      ...(admin ? {} : { active: true }),
    },
  });
};

export const updateMember = async (
  id: string,
  data: UpdateMemberData
) => {
  const existing = await prisma.ourMember.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  let imageUrl = existing.imageUrl;
  let imagePublicId = existing.imagePublicId;

  if (data.image) {
    const uploaded = await uploadImageBuffer(
      data.image,
      "german-learning/members"
    );

    imageUrl = uploaded.secure_url;
    imagePublicId = uploaded.public_id;

    await deleteCloudinaryImage(existing.imagePublicId);
  }

  return prisma.ourMember.update({
    where: { id },
    data: {
      name: data.name,
      language: data.language,
      role: data.role,
      shortDescription: data.shortDescription,
      order: data.order,
      active: data.active,
      imageUrl,
      imagePublicId,
    },
  });
};

export const deleteMember = async (id: string) => {
  const existing = await prisma.ourMember.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error("MEMBER_NOT_FOUND");
  }

  await deleteCloudinaryImage(existing.imagePublicId);

  return prisma.ourMember.delete({
    where: { id },
  });
};