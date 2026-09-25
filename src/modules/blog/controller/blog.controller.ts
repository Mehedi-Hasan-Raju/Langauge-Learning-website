import { Request, Response } from "express";

import {
  createBlog,
  getPublishedBlogs,
  getAllBlogs,
  getBlogBySlug,
  updateBlog,
  deleteBlog,
  likeBlog,
  unlikeBlog,
  getBlogLikeStatus,
} from "../service/blog.service";

import {
  AuthRequest,
} from "../../../middlewares/auth.middleware";


export const createBlogController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message:
            "Authentication required",
        });
      }

      const {
        title,
        slug,
        shortDescription,
        content,
        category,
        tags,
        published,
      } = req.body;

      if (
        !title ||
        !shortDescription ||
        !content
      ) {
        return res.status(400).json({
          success: false,
          message:
            "title, shortDescription and content are required",
        });
      }

      let parsedTags: string[] = [];

      if (typeof tags === "string") {
        try {
          parsedTags =
            JSON.parse(tags);
        } catch {
          parsedTags = tags
            .split(",")
            .map((tag) =>
              tag.trim()
            )
            .filter(Boolean);
        }
      } else if (Array.isArray(tags)) {
        parsedTags = tags;
      }

      const blog =
        await createBlog({
          title,
          slug,
          shortDescription,
          content,
          category,
          tags: parsedTags,
          published:
            published === true ||
            published === "true",
          authorId:
            req.user.userId,
          imageBuffer:
            req.file?.buffer,
        });

      return res.status(201).json({
        success: true,
        message:
          "Blog created successfully",
        blog,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to create blog",
      });
    }
  };

  //public list 

export const getPublishedBlogsController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const blogs =
        await getPublishedBlogs();

      return res.status(200).json({
        success: true,
        blogs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch blogs",
      });
    }
  };

export const getAllBlogsController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      const blogs =
        await getAllBlogs();

      return res.status(200).json({
        success: true,
        blogs,
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch blogs",
      });
    }
  };

export const getBlogBySlugController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { slug } = req.params;

      if (typeof slug !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid slug",
        });
      }

      const blog =
        await getBlogBySlug(slug);

      return res.status(200).json({
        success: true,
        blog,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Blog not found",
      });
    }
  };

export const updateBlogController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid blog id",
        });
      }

      let parsedTags:
        | string[]
        | undefined;

      if (req.body.tags !== undefined) {
        if (typeof req.body.tags === "string") {
          try {
            parsedTags =
              JSON.parse(
                req.body.tags
              );
          } catch {
            parsedTags =
              req.body.tags
                .split(",")
                .map((tag: string) =>
                  tag.trim()
                )
                .filter(Boolean);
          }
        } else if (
          Array.isArray(req.body.tags)
        ) {
          parsedTags = req.body.tags;
        }
      }

      const blog =
        await updateBlog(
          id,
          {
            title: req.body.title,
            slug: req.body.slug,
            shortDescription:
              req.body.shortDescription,
            content: req.body.content,
            category:
              req.body.category,
            tags: parsedTags,
            published:
              req.body.published !==
              undefined
                ? req.body.published ===
                  true ||
                  req.body.published ===
                    "true"
                : undefined,
            imageBuffer:
              req.file?.buffer,
          }
        );

      return res.status(200).json({
        success: true,
        message:
          "Blog updated successfully",
        blog,
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update blog",
      });
    }
  };

export const deleteBlogController =
  async (
    req: Request,
    res: Response
  ) => {
    try {
      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid blog id",
        });
      }

      await deleteBlog(id);

      return res.status(200).json({
        success: true,
        message:
          "Blog deleted successfully",
      });
    } catch (error) {
      return res.status(400).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to delete blog",
      });
    }
  };



export const likeBlogController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id",
      });
    }

    const result = await likeBlog(
      req.user.userId,
      id
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to like blog",
    });
  }
};


export const unlikeBlogController = async (
  req: AuthRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid blog id",
      });
    }

    const result = await unlikeBlog(
      req.user.userId,
      id
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to unlike blog",
    });
  }
};

export const getBlogLikeStatusController =
  async (
    req: AuthRequest,
    res: Response
  ) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      const { id } = req.params;

      if (typeof id !== "string") {
        return res.status(400).json({
          success: false,
          message: "Invalid blog id",
        });
      }

      const result =
        await getBlogLikeStatus(
          req.user.userId,
          id
        );

      return res.status(200).json({
        success: true,
        ...result,
      });
    } catch (error) {
      return res.status(404).json({
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to get blog like status",
      });
    }
  };