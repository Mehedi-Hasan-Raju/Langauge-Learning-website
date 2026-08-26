/*
  Warnings:

  - A unique constraint covering the columns `[bookId,chapterNo,sectionNo]` on the table `Chapter` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[chapterId,taskNo]` on the table `SentenceExercise` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `GrammarQuestion` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `type` on the `GrammarQuestion` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `type` on the `ListeningTask` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `taskNo` to the `SentenceExercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `WritingTask` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "VocabularyExerciseType" AS ENUM ('GERMAN_TO_ENGLISH', 'ENGLISH_TO_GERMAN', 'MULTIPLE_CHOICE');

-- CreateEnum
CREATE TYPE "GrammarQuestionType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_THE_GAP');

-- CreateEnum
CREATE TYPE "WritingTaskType" AS ENUM ('FILL_IN_THE_GAP', 'EMAIL', 'SHORT_MESSAGE');

-- CreateEnum
CREATE TYPE "ListeningTaskType" AS ENUM ('MULTIPLE_CHOICE', 'FILL_IN_THE_GAP', 'LISTEN_AND_WRITE');

-- CreateEnum
CREATE TYPE "SpeakingPracticeType" AS ENUM ('TOPIC', 'QUESTION', 'AI_CONVERSATION');

-- DropIndex
DROP INDEX "Chapter_bookId_chapterNo_key";

-- AlterTable
ALTER TABLE "Chapter" ADD COLUMN     "sectionNo" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "GrammarQuestion" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
DROP COLUMN "type",
ADD COLUMN     "type" "GrammarQuestionType" NOT NULL;

-- AlterTable
ALTER TABLE "ListeningTask" DROP COLUMN "type",
ADD COLUMN     "type" "ListeningTaskType" NOT NULL;

-- AlterTable
ALTER TABLE "SentenceExercise" ADD COLUMN     "taskNo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- AlterTable
ALTER TABLE "UserProgress" ADD COLUMN     "speakingProgress" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "WritingTask" ADD COLUMN     "type" "WritingTaskType" NOT NULL;

-- CreateTable
CREATE TABLE "VocabularyExercise" (
    "id" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "type" "VocabularyExerciseType" NOT NULL,
    "options" JSONB,
    "answer" TEXT NOT NULL,
    "explanation" TEXT,
    "vocabularyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VocabularyExercise_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingPractice" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "instruction" TEXT NOT NULL,
    "prompt" TEXT,
    "type" "SpeakingPracticeType" NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SpeakingPractice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpeakingSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "practiceId" TEXT NOT NULL,
    "audioUrl" TEXT,
    "transcript" TEXT,
    "score" DOUBLE PRECISION,
    "feedback" JSONB,
    "grammarErrors" JSONB,
    "vocabularyFeedback" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SpeakingSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VocabularyExercise_vocabularyId_idx" ON "VocabularyExercise"("vocabularyId");

-- CreateIndex
CREATE INDEX "SpeakingPractice_chapterId_idx" ON "SpeakingPractice"("chapterId");

-- CreateIndex
CREATE INDEX "SpeakingPractice_chapterId_type_idx" ON "SpeakingPractice"("chapterId", "type");

-- CreateIndex
CREATE INDEX "SpeakingSubmission_userId_idx" ON "SpeakingSubmission"("userId");

-- CreateIndex
CREATE INDEX "SpeakingSubmission_practiceId_idx" ON "SpeakingSubmission"("practiceId");

-- CreateIndex
CREATE INDEX "SpeakingSubmission_userId_practiceId_idx" ON "SpeakingSubmission"("userId", "practiceId");

-- CreateIndex
CREATE UNIQUE INDEX "Chapter_bookId_chapterNo_sectionNo_key" ON "Chapter"("bookId", "chapterNo", "sectionNo");

-- CreateIndex
CREATE UNIQUE INDEX "SentenceExercise_chapterId_taskNo_key" ON "SentenceExercise"("chapterId", "taskNo");

-- CreateIndex
CREATE INDEX "WritingSubmission_userId_taskId_idx" ON "WritingSubmission"("userId", "taskId");

-- AddForeignKey
ALTER TABLE "VocabularyExercise" ADD CONSTRAINT "VocabularyExercise_vocabularyId_fkey" FOREIGN KEY ("vocabularyId") REFERENCES "Vocabulary"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingPractice" ADD CONSTRAINT "SpeakingPractice_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SpeakingSubmission" ADD CONSTRAINT "SpeakingSubmission_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "SpeakingPractice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
