-- CreateTable
CREATE TABLE "ListeningSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ListeningSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ListeningSubmission_userId_idx" ON "ListeningSubmission"("userId");

-- CreateIndex
CREATE INDEX "ListeningSubmission_taskId_idx" ON "ListeningSubmission"("taskId");

-- CreateIndex
CREATE INDEX "ListeningSubmission_userId_taskId_idx" ON "ListeningSubmission"("userId", "taskId");

-- AddForeignKey
ALTER TABLE "ListeningSubmission" ADD CONSTRAINT "ListeningSubmission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ListeningSubmission" ADD CONSTRAINT "ListeningSubmission_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "ListeningTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
