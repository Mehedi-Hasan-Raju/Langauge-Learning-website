import { prisma } from "../../../../lib/prisma";
import { generateGermanSpeech } from "../../../../lib/text-to-speech";
import cloudinary from "../../../../lib/cloudinary";

import fs from "fs/promises";
import os from "os";
import path from "path";
import crypto from "crypto";


const getCloudinaryPublicId = (
  audioUrl: string
): string | null => {
  try {
    const url = new URL(audioUrl);

    const uploadIndex = url.pathname.indexOf("/upload/");

    if (uploadIndex === -1) {
      return null;
    }

    let publicId = url.pathname.slice(
      uploadIndex + "/upload/".length
    );

    // Remove version, e.g. v123456789/
    publicId = publicId.replace(/^v\d+\//, "");

    // Remove file extension
    publicId = publicId.replace(/\.[^/.]+$/, "");

    return publicId;
  } catch {
    return null;
  }
};

const deleteCloudinaryAudio = async (
  audioUrl: string
) => {
  const publicId = getCloudinaryPublicId(audioUrl);

  if (!publicId) {
    return;
  }

  try {
    await cloudinary.uploader.destroy(publicId, {
      resource_type: "video",
    });
  } catch (error) {
    console.error(
      "Cloudinary audio deletion failed:",
      error
    );
  }
};


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

  const newGermanWord =
    data.germanWord !== undefined
      ? data.germanWord.trim()
      : vocabulary.germanWord;

  const germanWordChanged =
    newGermanWord !== vocabulary.germanWord;

  // ------------------------------------------------
  // CASE 1: German word did not change
  // ------------------------------------------------
  if (!germanWordChanged) {
    return await prisma.vocabulary.update({
      where: {
        id,
      },
      data: {
        ...(data.englishMeaning !== undefined && {
          englishMeaning: data.englishMeaning.trim(),
        }),

        ...(data.article !== undefined && {
          article: data.article.trim(),
        }),

        ...(data.plural !== undefined && {
          plural: data.plural.trim(),
        }),
      },
    });
  }

  // ------------------------------------------------
  // CASE 2: German word changed
  // Generate new pronunciation
  // ------------------------------------------------

  const tempDir = await fs.mkdtemp(
    path.join(os.tmpdir(), "german-tts-")
  );

  const fileName = `${crypto.randomUUID()}.mp3`;
  const audioPath = path.join(tempDir, fileName);

  let uploadedAudio: any = null;

  try {
    // 1. Generate new German pronunciation
    await generateGermanSpeech(
      newGermanWord,
      audioPath
    );

    // 2. Upload new audio to Cloudinary
    uploadedAudio =
      await cloudinary.uploader.upload(
        audioPath,
        {
          folder: "german-learning/vocabulary",
          resource_type: "video",
          public_id: `vocabulary-${crypto.randomUUID()}`,
          format: "mp3",
        }
      );

    // 3. Update database
    const updatedVocabulary =
      await prisma.vocabulary.update({
        where: {
          id,
        },
        data: {
          germanWord: newGermanWord,

          ...(data.englishMeaning !== undefined && {
            englishMeaning:
              data.englishMeaning.trim(),
          }),

          ...(data.article !== undefined && {
            article: data.article.trim(),
          }),

          ...(data.plural !== undefined && {
            plural: data.plural.trim(),
          }),

          audioUrl: uploadedAudio.secure_url,
        },
      });

    // 4. Delete old Cloudinary audio
    if (vocabulary.audioUrl) {
      await deleteCloudinaryAudio(
        vocabulary.audioUrl
      );
    }

    return updatedVocabulary;
  } catch (error) {
    console.error(
      "Vocabulary update failed:",
      error
    );

    // If new audio was uploaded but DB update failed,
    // delete the new Cloudinary file.
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
          "New Cloudinary audio cleanup failed:",
          cleanupError
        );
      }
    }

    throw error;
  } finally {
    // Delete temporary MP3
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

  // 1. Delete Cloudinary audio
  if (vocabulary.audioUrl) {
    await deleteCloudinaryAudio(
      vocabulary.audioUrl
    );
  }

  // 2. Delete database record
  return await prisma.vocabulary.delete({
    where: {
      id,
    },
  });
};