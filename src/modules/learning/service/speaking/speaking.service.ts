import { prisma } from "../../../../lib/prisma";
import {
  uploadSpeakingAudio,
} from "../../../../lib/cloudinary-speaking";

import {
  evaluateGermanSpeaking,
} from "./gemini-speaking.service";

import cloudinary from "../../../../lib/cloudinary";

interface CreateSpeakingPracticeInput {
  title: string;
  instruction: string;
  prompt?: string;
  type:
    | "TOPIC"
    | "QUESTION"
    | "AI_CONVERSATION";
  chapterId: string;
}

export const createSpeakingPractice = async (
  data: CreateSpeakingPracticeInput
) => {
  const chapter = await prisma.chapter.findUnique({
    where: {
      id: data.chapterId,
    },
  });

  if (!chapter) {
    throw new Error("Chapter not found");
  }

  return await prisma.speakingPractice.create({
    data: {
      title: data.title.trim(),
      instruction: data.instruction.trim(),
      prompt: data.prompt?.trim(),
      type: data.type,
      chapterId: data.chapterId,
    },
  });
};

export const getSpeakingPracticesByChapter =
  async (chapterId: string) => {
    const chapter =
      await prisma.chapter.findUnique({
        where: {
          id: chapterId,
        },
      });

    if (!chapter) {
      throw new Error("Chapter not found");
    }

    return await prisma.speakingPractice.findMany({
      where: {
        chapterId,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  };

export const getSpeakingPracticeById = async (
  id: string
) => {
  const practice =
    await prisma.speakingPractice.findUnique({
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
      },
    });

  if (!practice) {
    throw new Error(
      "Speaking practice not found"
    );
  }

  return practice;
};

export const updateSpeakingPractice = async (
  id: string,
  data: {
    title?: string;
    instruction?: string;
    prompt?: string | null;
    type?:
      | "TOPIC"
      | "QUESTION"
      | "AI_CONVERSATION";
  }
) => {
  const practice =
    await prisma.speakingPractice.findUnique({
      where: {
        id,
      },
    });

  if (!practice) {
    throw new Error(
      "Speaking practice not found"
    );
  }

  return await prisma.speakingPractice.update({
    where: {
      id,
    },
    data: {
      ...(data.title !== undefined && {
        title: data.title.trim(),
      }),

      ...(data.instruction !== undefined && {
        instruction:
          data.instruction.trim(),
      }),

      ...(data.prompt !== undefined && {
        prompt:
          data.prompt === null
            ? null
            : data.prompt.trim(),
      }),

      ...(data.type !== undefined && {
        type: data.type,
      }),
    },
  });
};

export const deleteSpeakingPractice = async (
  id: string
) => {
  const practice =
    await prisma.speakingPractice.findUnique({
      where: {
        id,
      },
    });

  if (!practice) {
    throw new Error(
      "Speaking practice not found"
    );
  }

  return await prisma.speakingPractice.delete({
    where: {
      id,
    },
  });
};


export const submitSpeakingAnswer =
  async (data: {
    userId: string;
    practiceId: string;
    audioBuffer: Buffer;
  }) => {
    const practice =
      await prisma.speakingPractice.findUnique({
        where: {
          id: data.practiceId,
        },
      });

    if (!practice) {
      throw new Error(
        "Speaking practice not found"
      );
    }

    if (!data.audioBuffer.length) {
      throw new Error(
        "Audio file is empty"
      );
    }

    // ------------------------------------------
    // Upload learner audio to Cloudinary
    // ------------------------------------------

    const uploadedAudio =
      await uploadSpeakingAudio(
        data.audioBuffer
      );

    try {
      // ----------------------------------------
      // Gemini transcript + evaluation
      // ----------------------------------------

      const evaluation =
        await evaluateGermanSpeaking(
          data.audioBuffer,
          {
            title: practice.title,
            instruction:
              practice.instruction,
            prompt: practice.prompt,
            type: practice.type,
          }
        );

      const score = Math.max(
        0,
        Math.min(
          100,
          Math.round(
            Number(evaluation.score)
          )
        )
      );

      // ----------------------------------------
      // Save submission
      // ----------------------------------------

      const submission =
        await prisma.speakingSubmission.create({
          data: {
            userId: data.userId,
            practiceId: data.practiceId,
            audioUrl:
              uploadedAudio.secure_url,
            transcript:
              evaluation.transcript,
            score,
            feedback: {
              ...evaluation,
              score,
            },
            grammarErrors:
              evaluation.grammarErrors ?? [],
            vocabularyFeedback:
              evaluation.vocabularyFeedback ?? [],
          },
        });

      // ----------------------------------------
      // NOTE:
      // Speaking does NOT affect UserProgress
      // overallProgress.
      // ----------------------------------------

      return {
        submission,

        result: {
          transcript:
            evaluation.transcript,

          score,

          grammarScore:
            evaluation.grammarScore,

          vocabularyScore:
            evaluation.vocabularyScore,

          fluencyScore:
            evaluation.fluencyScore,

          feedback:
            evaluation.feedback,

          correctedText:
            evaluation.correctedText,

          grammarErrors:
            evaluation.grammarErrors,

          vocabularyFeedback:
            evaluation.vocabularyFeedback,
        },
      };
    } catch (error) {
      // Gemini failed after Cloudinary upload.
      // Delete uploaded audio to avoid orphan files.

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
            "Speaking audio cleanup failed:",
            cleanupError
          );
        }
      }

      throw error;
    }
  };