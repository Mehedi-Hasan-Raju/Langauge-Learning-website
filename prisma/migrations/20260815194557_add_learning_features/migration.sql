-- AlterTable
ALTER TABLE "GrammarQuestion" ADD COLUMN     "explanation" TEXT;

-- AlterTable
ALTER TABLE "GrammarTopic" ADD COLUMN     "videoUrl" TEXT;

-- AlterTable
ALTER TABLE "SentenceExercise" ADD COLUMN     "explanation" TEXT;

-- CreateTable
CREATE TABLE "ListeningTask" (
    "id" TEXT NOT NULL,
    "taskNo" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB,
    "answer" JSONB NOT NULL,
    "explanation" TEXT,
    "listeningExerciseId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ListeningTask_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListeningTask_listeningExerciseId_idx" ON "ListeningTask"("listeningExerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "ListeningTask_listeningExerciseId_taskNo_key" ON "ListeningTask"("listeningExerciseId", "taskNo");

-- AddForeignKey
ALTER TABLE "ListeningTask" ADD CONSTRAINT "ListeningTask_listeningExerciseId_fkey" FOREIGN KEY ("listeningExerciseId") REFERENCES "ListeningExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
