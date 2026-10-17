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

type VocabularyExerciseType =
  | "GERMAN_TO_ENGLISH"
  | "ENGLISH_TO_GERMAN"
  | "MULTIPLE_CHOICE";

type VocabularyExerciseData = {
  question: string;
  type: VocabularyExerciseType;
  answer: string;
  options?: string[];
  explanation?: string;
  chapterId: string;
};

export const createVocabularyExercise = async (
  data: VocabularyExerciseData
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
    select: {
      id: true,
    },
  });

  if (!chapter) {
    throw new Error("Practice chapter not found");
  }

  return prisma.vocabularyExercise.create({
    data: {
      question: data.question,
      type: data.type,
      answer: data.answer,
      options: data.options,
      explanation: data.explanation,
      chapterId: data.chapterId,
    },
    include: {
      chapter: true,
      vocabulary: true,
    },
  });
};

export const getVocabularyExercisesByChapter = async (
  chapterId: string
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: chapterId,
    },
    select: {
      id: true,
    },
  });

  if (!chapter) {
    throw new Error("Practice chapter not found");
  }

  return prisma.vocabularyExercise.findMany({
    where: {
      chapterId,
    },
    include: {
      vocabulary: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
};

export const getVocabularyExerciseById = async (
  id: string
) => {
  const exercise = await prisma.vocabularyExercise.findUnique({
    where: {
      id,
    },
    include: {
      chapter: true,
      vocabulary: true,
    },
  });

  if (!exercise) {
    throw new Error("Vocabulary exercise not found");
  }

  return exercise;
};

export const updateVocabularyExercise = async (
  id: string,
  data: Partial<Omit<VocabularyExerciseData, "chapterId">> & {
    chapterId?: string;
  }
) => {
  const exercise = await prisma.vocabularyExercise.findUnique({
    where: {
      id,
    },
  });

  if (!exercise) {
    throw new Error("Vocabulary exercise not found");
  }

  if (data.chapterId !== undefined) {
    const chapter = await prisma.chapter.findUnique({
      where: {
        id: data.chapterId,
      },
      select: {
        id: true,
      },
    });

    if (!chapter) {
      throw new Error("Practice chapter not found");
    }
  }

  return prisma.vocabularyExercise.update({
    where: {
      id,
    },
    data: {
      ...(data.question !== undefined && {
        question: data.question,
      }),
      ...(data.type !== undefined && {
        type: data.type,
      }),
      ...(data.answer !== undefined && {
        answer: data.answer,
      }),
      ...(data.options !== undefined && {
        options: data.options,
      }),
      ...(data.explanation !== undefined && {
        explanation: data.explanation,
      }),
      ...(data.chapterId !== undefined && {
        chapterId: data.chapterId,
      }),
    },
    include: {
      chapter: true,
      vocabulary: true,
    },
  });
};

export const deleteVocabularyExercise = async (
  id: string
) => {
  const exercise = await prisma.vocabularyExercise.findUnique({
    where: {
      id,
    },
  });

  if (!exercise) {
    throw new Error("Vocabulary exercise not found");
  }

  return prisma.vocabularyExercise.delete({
    where: {
      id,
    },
    include: {
      chapter: true,
      vocabulary: true,
    },
  });
};

export const submitVocabularyExerciseAnswer = async (data: {
  userId: string;
  exerciseId: string;
  userAnswer: string;
}) => {
  const userAnswer = data.userAnswer.trim();

  if (!userAnswer) {
    throw new Error("Answer cannot be empty");
  }

  return prisma.$transaction(async (tx) => {
    const exercise = await tx.vocabularyExercise.findUnique({
      where: {
        id: data.exerciseId,
      },
    });

    if (!exercise) {
      throw new Error("Vocabulary exercise not found");
    }

    const isCorrect =
      userAnswer.toLocaleLowerCase() ===
      exercise.answer.trim().toLocaleLowerCase();
    const score = isCorrect ? 100 : 0;

    const submission =
      await tx.vocabularyExerciseSubmission.create({
        data: {
          userId: data.userId,
          exerciseId: data.exerciseId,
          userAnswer,
          isCorrect,
          score,
        },
      });

    const previousSubmissions =
      await tx.vocabularyExerciseSubmission.findMany({
        where: {
          userId: data.userId,
          id: {
            not: submission.id,
          },
        },
        include: {
          exercise: {
            select: {
              chapterId: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    const latestByExercise = new Map<
      string,
      (typeof previousSubmissions)[number]
    >();
    latestByExercise.set(data.exerciseId, {
      ...submission,
      exercise: {
        chapterId: exercise.chapterId,
      },
    });

    for (const item of previousSubmissions) {
      if (!latestByExercise.has(item.exerciseId)) {
        latestByExercise.set(item.exerciseId, item);
      }
    }

    const chapterSubmissions = Array.from(
      latestByExercise.values()
    ).filter((item) => item.exercise.chapterId === exercise.chapterId);

    const totalChapterTasks =
      await tx.vocabularyExercise.count({
        where: {
          chapterId: exercise.chapterId,
        },
      });
    const completedTasks = chapterSubmissions.length;
    const vocabularyProgress =
      totalChapterTasks === 0
        ? 0
        : Math.min(
            100,
            Number(
              (
                (completedTasks / totalChapterTasks) *
                100
              ).toFixed(2)
            )
          );
    const chapterAccuracy =
      completedTasks === 0
        ? 0
        : Number(
            (
              chapterSubmissions.reduce(
                (sum, item) => sum + item.score,
                0
              ) / completedTasks
            ).toFixed(2)
          );

    const totalVocabularyTasks =
      await tx.vocabularyExercise.count();
    const latestUserSubmissions = Array.from(
      latestByExercise.values()
    );
    const skillProgress =
      totalVocabularyTasks === 0
        ? 0
        : Math.min(
            100,
            Number(
              (
                (latestUserSubmissions.length /
                  totalVocabularyTasks) *
                100
              ).toFixed(2)
            )
          );
    const skillScore =
      latestUserSubmissions.length === 0
        ? 0
        : Number(
            (
              latestUserSubmissions.reduce(
                (sum, item) => sum + item.score,
                0
              ) / latestUserSubmissions.length
            ).toFixed(2)
          );

    const existingSkillProgress =
      await tx.skillProgress.findUnique({
        where: {
          userId_skill: {
            userId: data.userId,
            skill: "VOCABULARY",
          },
        },
      });

    await tx.skillProgress.upsert({
      where: {
        userId_skill: {
          userId: data.userId,
          skill: "VOCABULARY",
        },
      },
      create: {
        userId: data.userId,
        skill: "VOCABULARY",
        completedTasks: latestUserSubmissions.length,
        totalTasks: totalVocabularyTasks,
        currentScore: skillScore,
        previousScore: 0,
      },
      update: {
        completedTasks: latestUserSubmissions.length,
        totalTasks: totalVocabularyTasks,
        currentScore: skillScore,
        previousScore: existingSkillProgress?.currentScore ?? 0,
      },
    });

    const existingChapterProgress =
      await tx.userProgress.findUnique({
        where: {
          userId_chapterId: {
            userId: data.userId,
            chapterId: exercise.chapterId,
          },
        },
      });

    const grammarProgress =
      existingChapterProgress?.grammarProgress ?? 0;
    const listeningProgress =
      existingChapterProgress?.listeningProgress ?? 0;
    const writingProgress =
      existingChapterProgress?.writingProgress ?? 0;
    const sentenceProgress =
      existingChapterProgress?.sentenceProgress ?? 0;
    const overallProgress = Number(
      (
        (grammarProgress +
          vocabularyProgress +
          listeningProgress +
          writingProgress +
          sentenceProgress) /
        5
      ).toFixed(2)
    );

    const chapterProgress = await tx.userProgress.upsert({
      where: {
        userId_chapterId: {
          userId: data.userId,
          chapterId: exercise.chapterId,
        },
      },
      create: {
        userId: data.userId,
        chapterId: exercise.chapterId,
        grammarProgress,
        vocabularyProgress,
        listeningProgress,
        writingProgress,
        sentenceProgress,
        overallProgress,
      },
      update: {
        vocabularyProgress,
        overallProgress,
      },
    });

    await tx.activityRecord.create({
      data: {
        userId: data.userId,
        skill: "VOCABULARY",
        activityType: "VOCABULARY_EXERCISE",
        referenceId: data.exerciseId,
        score,
        durationMinutes: 0,
      },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dailyActivity = await tx.dailyActivity.findFirst({
      where: {
        userId: data.userId,
        date: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    if (dailyActivity) {
      await tx.dailyActivity.update({
        where: {
          id: dailyActivity.id,
        },
        data: {
          completedTasks: {
            increment: 1,
          },
          vocabularyCompleted: {
            increment: 1,
          },
        },
      });
    } else {
      await tx.dailyActivity.create({
        data: {
          userId: data.userId,
          date: today,
          completedTasks: 1,
          vocabularyCompleted: 1,
        },
      });
    }

    const profile = await tx.userProfile.findUnique({
      where: {
        userId: data.userId,
      },
    });
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let currentStreak = 1;

    if (profile?.lastActiveDate) {
      const lastActive = new Date(profile.lastActiveDate);
      lastActive.setHours(0, 0, 0, 0);

      if (lastActive.getTime() === today.getTime()) {
        currentStreak = profile.currentStreak;
      } else if (lastActive.getTime() === yesterday.getTime()) {
        currentStreak = profile.currentStreak + 1;
      }
    }

    await tx.userProfile.upsert({
      where: {
        userId: data.userId,
      },
      create: {
        userId: data.userId,
        currentStreak,
        longestStreak: Math.max(
          profile?.longestStreak ?? 0,
          currentStreak
        ),
        lastActiveDate: new Date(),
      },
      update: {
        currentStreak,
        longestStreak: Math.max(
          profile?.longestStreak ?? 0,
          currentStreak
        ),
        lastActiveDate: new Date(),
      },
    });

    return {
      submission,
      result: {
        isCorrect,
        correctAnswer: exercise.answer,
        explanation: exercise.explanation,
      },
      progress: {
        completedTasks,
        totalTasks: totalChapterTasks,
        attemptsPercentage: vocabularyProgress,
        accuracy: chapterAccuracy,
        skillProgress: {
          completedTasks: latestUserSubmissions.length,
          totalTasks: totalVocabularyTasks,
          percentage: skillProgress,
          accuracy: skillScore,
        },
        chapterProgress: {
          vocabularyProgress,
          overallProgress: chapterProgress.overallProgress,
        },
      },
    };
  }, {
    timeout: 15_000,
  });
};