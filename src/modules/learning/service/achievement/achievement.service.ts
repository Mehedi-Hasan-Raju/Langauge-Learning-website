import { prisma } from "../../../../lib/prisma";

export const ACHIEVEMENTS = {
  FIRST_LESSON: {
    key: "FIRST_LESSON",
    title: "First Lesson",
    description: "Complete your first learning task.",
  },

  FIRST_GRAMMAR: {
    key: "FIRST_GRAMMAR",
    title: "Grammar Starter",
    description: "Complete your first Grammar task.",
  },

  FIRST_VOCABULARY: {
    key: "FIRST_VOCABULARY",
    title: "Word Collector",
    description:
      "Complete your first Vocabulary task.",
  },

  FIRST_LISTENING: {
    key: "FIRST_LISTENING",
    title: "Good Listener",
    description:
      "Complete your first Listening task.",
  },

  FIRST_WRITING: {
    key: "FIRST_WRITING",
    title: "First Writer",
    description:
      "Complete your first Schreiben task.",
  },

  FIRST_SENTENCE: {
    key: "FIRST_SENTENCE",
    title: "Sentence Builder",
    description:
      "Complete your first Sentence Building task.",
  },

  FIRST_SPEAKING: {
    key: "FIRST_SPEAKING",
    title: "First Speaker",
    description:
      "Complete your first Speaking practice.",
  },

  TEN_TASKS: {
    key: "10_TASKS",
    title: "Getting Started",
    description:
      "Complete 10 learning tasks.",
  },

  FIFTY_TASKS: {
    key: "50_TASKS",
    title: "Dedicated Learner",
    description:
      "Complete 50 learning tasks.",
  },

  SEVEN_DAY_STREAK: {
    key: "7_DAY_STREAK",
    title: "7 Day Streak",
    description:
      "Maintain a 7-day learning streak.",
  },

  FIFTEEN_DAY_STREAK: {
    key: "15_DAY_STREAK",
    title: "15 Day Streak",
    description:
      "Maintain a 15-day learning streak.",
  },
  
} as const;