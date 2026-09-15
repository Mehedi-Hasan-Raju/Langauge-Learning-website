-- CreateTable
CREATE TABLE "SentenceSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SentenceSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SentenceSubmission_userId_idx" ON "SentenceSubmission"("userId");

-- CreateIndex
CREATE INDEX "SentenceSubmission_exerciseId_idx" ON "SentenceSubmission"("exerciseId");

-- CreateIndex
CREATE INDEX "SentenceSubmission_userId_exerciseId_idx" ON "SentenceSubmission"("userId", "exerciseId");

-- AddForeignKey
ALTER TABLE "SentenceSubmission" ADD CONSTRAINT "SentenceSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SentenceSubmission" ADD CONSTRAINT "SentenceSubmission_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "SentenceExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
