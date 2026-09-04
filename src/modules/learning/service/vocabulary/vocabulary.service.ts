import { prisma } from "../../../../lib/prisma";
import { generateGermanSpeech } from "../../../../lib/text-to-speech";
import cloudinary from "../../../../lib/cloudinary";

import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";



interface CreateVocabularyInput {
  germanWord: string;
  englishMeaning: string;
  article?: string;
  plural?: string;
  chapterId: string;
}

export const createVocabulary = async (
  data: CreateVocabularyInput
) => {
  const {
    germanWord,
    englishMeaning,
    article,
    plural,
    chapterId,
  } = data;

  // Check chapter
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  // Temporary directory
  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "german-tts-")
  );

  const fileName = `${crypto.randomUUID()}.mp3`;

  const audioPath = path.join(tempDir, fileName);

  let uploadedAudio: any = null;

  try {
    // 1. Generate German speech
    await generateGermanSpeech(
      germanWord,
      audioPath
    );

    // 2. Upload to Cloudinary
    uploadedAudio = await cloudinary.uploader.upload(
      audioPath,
      {
        folder: "german-learning/vocabulary",
        resource_type: "video",
        public_id: `vocabulary-${crypto.randomUUID()}`,
        format: "mp3",
      }
    );

    // 3. Save Vocabulary + audioUrl
    const vocabulary = await prisma.vocabulary.create({
      data: {
        germanWord,
        englishMeaning,
        article,
        plural,
        chapterId,
        audioUrl: uploadedAudio.secure_url,
      },
    });

    return vocabulary;

  } catch (error) {
    console.error("Vocabulary creation failed:", error);

    // Cleanup uploaded Cloudinary file
    if (uploadedAudio?.public_id) {
      try {
        await cloudinary.uploader.destroy(
          uploadedAudio.public_id,
          {
            resource_type: "video",
          }
        );
      } catch (cleanupError) {
        console.error(
          "Cloudinary cleanup failed:",
          cleanupError
        );
      }
    }

    throw error;

  } finally {
    // Delete local temporary files
    try {
      await fs.rm(tempDir, {
        recursive: true,
        force: true,
      });
    } catch (cleanupError) {
      console.error(
        "Temporary file cleanup failed:",
        cleanupError
      );
    }
  }
};
export const getVocabularyByChapter = async (
  chapterId: string
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.vocabulary.findMany({
    where: {
      chapterId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getVocabularyById = async (
  id: string
) => {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: {
      id,
    },
    include: {
      chapter: {
        include: {
          book: {
            include: {
              level: true,
            },
          },
        },
      },
      exercises: true,
    },
  });

  if (!vocabulary) {
    throw new Error("Vocabulary not found");
  }

  return vocabulary;
};

export const updateVocabulary = async (
  id: string,
  data: {
    germanWord?: string;
    englishMeaning?: string;
    article?: string;
    plural?: string;
    audioUrl?: string;
  }
) => {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: {
      id,
    },
  });

  if (!vocabulary) {
    throw new Error("Vocabulary not found");
  }

  return await prisma.vocabulary.update({
    where: {
      id,
    },
    data: {
      ...(data.germanWord !== undefined && {
        germanWord: data.germanWord,
      }),
      ...(data.englishMeaning !== undefined && {
        englishMeaning: data.englishMeaning,
      }),
      ...(data.article !== undefined && {
        article: data.article,
      }),
      ...(data.plural !== undefined && {
        plural: data.plural,
      }),
      ...(data.audioUrl !== undefined && {
        audioUrl: data.audioUrl,
      }),
    },
  });
};

export const deleteVocabulary = async (
  id: string
) => {
  const vocabulary = await prisma.vocabulary.findUnique({
    where: {
      id,
    },
  });

  if (!vocabulary) {
    throw new Error("Vocabulary not found");
  }

  return await prisma.vocabulary.delete({
    where: {
      id,
    },
  });
};
