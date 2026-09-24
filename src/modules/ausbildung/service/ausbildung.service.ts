import { prisma } from "../../../lib/prisma";
import cloudinary from "../../../lib/cloudinary";
import {
  uploadAusbildungImage,
} from "../../../lib/cloudinary-image";


const getCloudinaryPublicId = (
  imageUrl: string
): string | null => {
  try {
    const url = new URL(imageUrl);

    const uploadIndex =
      url.pathname.indexOf("/upload/");

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = url.pathname.slice(
      uploadIndex + "/upload/".length
    );

    // Remove version
    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

    // Remove extension
    publicId = publicId.replace(
      /\.[^/.]+$/,
      ""
    );

    return publicId;
  } catch {
    return null;
  }
};

const deleteCloudinaryImage = async (
  imageUrl: string
) => {
  const publicId =
    getCloudinaryPublicId(imageUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );
  } catch (error) {
    console.error(
      "Cloudinary image deletion failed:",
      error
    );
  }
};

interface CreateAusbildungInput {
  name: string;
  shortDescription: string;
  imageUrl?: string;
}

interface CreateApplicationDocumentInput {
  ausbildungId: string;
  title: string;
  description?: string;
  required?: boolean;
  order?: number;
}

interface CreateVisaDocumentInput {
  ausbildungId: string;
  title: string;
  description?: string;
  required?: boolean;
  order?: number;
}

export const createAusbildung = async (
  data: CreateAusbildungInput
) => {
  return await prisma.ausbildung.create({
    data: {
      name: data.name.trim(),
      shortDescription:
        data.shortDescription.trim(),
        imageUrl: data.imageUrl,
    },
  });
};

export const getAusbildungen = async () => {
  return await prisma.ausbildung.findMany({
    include: {
      applicationDocuments: {
        orderBy: {
          order: "asc",
        },
      },
      visaDocuments: {
        orderBy: {
          order: "asc",
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getAusbildungById = async (
  id: string
) => {
  const ausbildung =
    await prisma.ausbildung.findUnique({
      where: {
        id,
      },
      include: {
        applicationDocuments: {
          orderBy: {
            order: "asc",
          },
        },
        visaDocuments: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

  if (!ausbildung) {
    throw new Error(
      "Ausbildung not found"
    );
  }

  return ausbildung;
};
export const updateAusbildung = async (
  id: string,
  data: {
    name?: string;
    shortDescription?: string;
    imageBuffer?: Buffer;
  }
) => {
  const existing =
    await prisma.ausbildung.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "Ausbildung not found"
    );
  }

  let newImageUrl =
    existing.imageUrl;

  // New image uploaded
  if (data.imageBuffer) {
    const uploadedImage =
      await uploadAusbildungImage(
        data.imageBuffer
      );

    newImageUrl =
      uploadedImage.secure_url;
  }

  try {
    const updatedAusbildung =
      await prisma.ausbildung.update({
        where: {
          id,
        },

        data: {
          ...(data.name !== undefined && {
            name: data.name.trim(),
          }),

          ...(data.shortDescription !==
            undefined && {
            shortDescription:
              data.shortDescription.trim(),
          }),

          ...(data.imageBuffer && {
            imageUrl: newImageUrl,
          }),
        },
      });

    // Delete old image after DB update
    if (
      data.imageBuffer &&
      existing.imageUrl
    ) {
      await deleteCloudinaryImage(
        existing.imageUrl
      );
    }

    return updatedAusbildung;
  } catch (error) {
    // If DB update fails after new upload,
    // remove the newly uploaded image.
    if (
      data.imageBuffer &&
      newImageUrl &&
      newImageUrl !== existing.imageUrl
    ) {
      await deleteCloudinaryImage(
        newImageUrl
      );
    }

    throw error;
  }
};

export const deleteAusbildung = async (
  id: string
) => {
  const existing =
    await prisma.ausbildung.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error(
      "Ausbildung not found"
    );
  }

  // Delete Cloudinary image first
  if (existing.imageUrl) {
    await deleteCloudinaryImage(
      existing.imageUrl
    );
  }

  // Delete DB record
  return await prisma.ausbildung.delete({
    where: {
      id,
    },
  });
};

// Application Documents

export const createApplicationDocument =
  async (
    data: CreateApplicationDocumentInput
  ) => {
    const ausbildung =
      await prisma.ausbildung.findUnique({
        where: {
          id: data.ausbildungId,
        },
      });

    if (!ausbildung) {
      throw new Error(
        "Ausbildung not found"
      );
    }

    return await prisma.ausbildungApplicationDocument.create(
      {
        data: {
          ausbildungId:
            data.ausbildungId,

          title: data.title.trim(),

          description:
            data.description?.trim(),

          required:
            data.required ?? true,

          order:
            data.order ?? 0,
        },
      }
    );
  };

  export const getApplicationDocuments =
  async (
    ausbildungId: string
  ) => {
    return await prisma.ausbildungApplicationDocument.findMany(
      {
        where: {
          ausbildungId,
        },
        orderBy: {
          order: "asc",
        },
      }
    );
  };

export const updateApplicationDocument =
  async (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      required?: boolean;
      order?: number;
    }
  ) => {
    const document =
      await prisma.ausbildungApplicationDocument.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!document) {
      throw new Error(
        "Application document not found"
      );
    }

    return await prisma.ausbildungApplicationDocument.update(
      {
        where: {
          id,
        },
        data: {
          ...(data.title !== undefined && {
            title: data.title.trim(),
          }),

          ...(data.description !==
            undefined && {
            description:
              data.description === null
                ? null
                : data.description.trim(),
          }),

          ...(data.required !== undefined && {
            required: data.required,
          }),

          ...(data.order !== undefined && {
            order: data.order,
          }),
        },
      }
    );
  };

export const deleteApplicationDocument =
  async (
    id: string
  ) => {
    const document =
      await prisma.ausbildungApplicationDocument.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!document) {
      throw new Error(
        "Application document not found"
      );
    }

    return await prisma.ausbildungApplicationDocument.delete(
      {
        where: {
          id,
        },
      }
    );
  };

// visa Documents

export const createVisaDocument =
  async (
    data: CreateVisaDocumentInput
  ) => {
    const ausbildung =
      await prisma.ausbildung.findUnique({
        where: {
          id: data.ausbildungId,
        },
      });

    if (!ausbildung) {
      throw new Error(
        "Ausbildung not found"
      );
    }

    return await prisma.ausbildungVisaDocument.create(
      {
        data: {
          ausbildungId:
            data.ausbildungId,

          title: data.title.trim(),

          description:
            data.description?.trim(),

          required:
            data.required ?? true,

          order:
            data.order ?? 0,
        },
      }
    );
  };

export const getVisaDocuments = async (
  ausbildungId: string
) => {
  return await prisma.ausbildungVisaDocument.findMany(
    {
      where: {
        ausbildungId,
      },
      orderBy: {
        order: "asc",
      },
    }
  );
};

export const updateVisaDocument =
  async (
    id: string,
    data: {
      title?: string;
      description?: string | null;
      required?: boolean;
      order?: number;
    }
  ) => {
    const document =
      await prisma.ausbildungVisaDocument.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!document) {
      throw new Error(
        "Visa document not found"
      );
    }

    return await prisma.ausbildungVisaDocument.update(
      {
        where: {
          id,
        },
        data: {
          ...(data.title !== undefined && {
            title: data.title.trim(),
          }),

          ...(data.description !==
            undefined && {
            description:
              data.description === null
                ? null
                : data.description.trim(),
          }),

          ...(data.required !== undefined && {
            required: data.required,
          }),

          ...(data.order !== undefined && {
            order: data.order,
          }),
        },
      }
    );
  };

export const deleteVisaDocument =
  async (
    id: string
  ) => {
    const document =
      await prisma.ausbildungVisaDocument.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!document) {
      throw new Error(
        "Visa document not found"
      );
    }

    return await prisma.ausbildungVisaDocument.delete(
      {
        where: {
          id,
        },
      }
    );
  };