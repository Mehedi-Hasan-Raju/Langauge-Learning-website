-- CreateTable
CREATE TABLE "GrammarSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GrammarSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "GrammarSubmission_userId_idx" ON "GrammarSubmission"("userId");

-- CreateIndex
CREATE INDEX "GrammarSubmission_questionId_idx" ON "GrammarSubmission"("questionId");

-- CreateIndex
CREATE INDEX "GrammarSubmission_userId_questionId_idx" ON "GrammarSubmission"("userId", "questionId");

-- AddForeignKey
ALTER TABLE "GrammarSubmission" ADD CONSTRAINT "GrammarSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GrammarSubmission" ADD CONSTRAINT "GrammarSubmission_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "GrammarQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
