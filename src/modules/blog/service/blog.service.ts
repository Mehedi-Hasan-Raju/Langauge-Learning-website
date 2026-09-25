import { prisma } from "../../../lib/prisma";
import cloudinary from "../../../lib/cloudinary";
import { uploadBlogImage } from "../../../lib/cloudinary-image";
import { string } from "zod";

const createSlug = (title: string) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
};

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

    publicId = publicId.replace(
      /^v\d+\//,
      ""
    );

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
      "Blog image deletion failed:",
      error
    );
  }
};


interface CreateBlogInput {
  title: string;
  slug?: string;
  shortDescription: string;
  content: string;
  category?: string;
  tags?: string[];
  published?: boolean;
  authorId: string;
  imageBuffer?: Buffer;
}

export const createBlog = async (
  data: CreateBlogInput
) => {
  let slug =
    data.slug?.trim() ||
    createSlug(data.title);

  const existingSlug =
    await prisma.blog.findUnique({
      where: {
        slug,
      },
    });

  if (existingSlug) {
    throw new Error(
      "A blog with this slug already exists"
    );
  }

  let coverImage: string | undefined;

  if (data.imageBuffer) {
    const uploadedImage =
      await uploadBlogImage(
        data.imageBuffer
      );

    coverImage =
      uploadedImage.secure_url;
  }

  const published =
    data.published ?? false;

  return await prisma.blog.create({
    data: {
      title: data.title.trim(),
      slug,
      shortDescription:
        data.shortDescription.trim(),
      content: data.content,
      coverImage,
      category:
        data.category?.trim(),
      tags: data.tags ?? [],
      published,
      publishedAt: published
        ? new Date()
        : null,
      authorId: data.authorId,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
};


export const getPublishedBlogs = async () => {
  return await prisma.blog.findMany({
    where: {
      published: true,
    },
    select: {
      id: true,
      title: true,
      slug: true,
      shortDescription: true,
      coverImage: true,
      category: true,
      tags: true,
      publishedAt: true,
      createdAt: true,
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      publishedAt: "desc",
    },
  });
};

//Admin get all
export const getAllBlogs = async () => {
  return await prisma.blog.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};


export const getBlogBySlug = async (
  slug: string
) => {
  const blog =
    await prisma.blog.findUnique({
      where: {
        slug,
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

  if (!blog) {
    throw new Error("Blog not found");
  }

  return blog;
};

export const updateBlog = async (
  id: string,
  data: {
    title?: string;
    slug?: string;
    shortDescription?: string;
    content?: string;
    category?: string;
    tags?: string[];
    published?: boolean;
    imageBuffer?: Buffer;
  }
) => {
  const existing =
    await prisma.blog.findUnique({
      where: {
        id,
      },
    });

  if (!existing) {
    throw new Error("Blog not found");
  }

  if (
    data.slug !== undefined &&
    data.slug !== existing.slug
  ) {
    const duplicate =
      await prisma.blog.findUnique({
        where: {
          slug: data.slug.trim(),
        },
      });

    if (
      duplicate &&
      duplicate.id !== id
    ) {
      throw new Error(
        "A blog with this slug already exists"
      );
    }
  }

  let newImageUrl =
    existing.coverImage;

  if (data.imageBuffer) {
    const uploadedImage =
      await uploadBlogImage(
        data.imageBuffer
      );

    newImageUrl =
      uploadedImage.secure_url;
  }

  const published =
    data.published ??
    existing.published;

  const updatedBlog =
    await prisma.blog.update({
      where: {
        id,
      },
      data: {
        ...(data.title !== undefined && {
          title: data.title.trim(),
        }),

        ...(data.slug !== undefined && {
          slug: data.slug.trim(),
        }),

        ...(data.shortDescription !==
          undefined && {
          shortDescription:
            data.shortDescription.trim(),
        }),

        ...(data.content !== undefined && {
          content: data.content,
        }),

        ...(data.category !== undefined && {
          category:
            data.category.trim(),
        }),

        ...(data.tags !== undefined && {
          tags: data.tags,
        }),

        ...(data.imageBuffer && {
          coverImage: newImageUrl,
        }),

        published,

        publishedAt:
          published && !existing.published
            ? new Date()
            : existing.publishedAt,
      },

      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

  if (
    data.imageBuffer &&
    existing.coverImage
  ) {
    await deleteCloudinaryImage(
      existing.coverImage
    );
  }

  return updatedBlog;
};


export const deleteBlog = async (
  id: string
) => {
  const blog =
    await prisma.blog.findUnique({
      where: {
        id,
      },
    });

  if (!blog) {
    throw new Error("Blog not found");
  }

  if (blog.coverImage) {
    await deleteCloudinaryImage(
      blog.coverImage
    );
  }

  return await prisma.blog.delete({
    where: {
      id,
    },
  });
};


export const likeBlog = async (
  userId: string,
  blogId: string
) => {
  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },
  });

  if (!blog) {
    throw new Error("Blog not Found");
  }

  if (!blog.published) {
    throw new Error ("You cannot like an Unpublished blog");
  }
 const existingLike =
    await prisma.blogLike.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

  if(existingLike) {
    return {
      liked: true,
      message: "Blog alrready liked",
    };
  }
    await prisma.blogLike.create({
    data: {
      userId,
      blogId,
    },
  });

  return {
    liked: true,
    message: "Blog liked successfully",
  };
};
  

export const unlikeBlog = async (
  userId: string,
  blogId: string
) => {
  const existingLike =
    await prisma.blogLike.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

  if (!existingLike) {
    return {
      liked: false,
      message: "Blog is not liked",
    };
  }

  await prisma.blogLike.delete({
    where: {
      userId_blogId: {
        userId,
        blogId,
      },
    },
  });

  return {
    liked: false,
    message: "Blog unliked successfully",
  };
};

export const getBlogLikeStatus = async (
  userId: string,
  blogId: string
) => {
  const blog = await prisma.blog.findUnique({
    where: {
      id: blogId,
    },
    select: {
      id: true,
      _count: {
        select: {
          likes: true,
        },
      },
    },
  });

  if (!blog) {
    throw new Error("Blog not found");
  }

  const existingLike =
    await prisma.blogLike.findUnique({
      where: {
        userId_blogId: {
          userId,
          blogId,
        },
      },
    });

  return {
    blogId,
    liked: Boolean(existingLike),
    likeCount: blog._count.likes,
  };
};
