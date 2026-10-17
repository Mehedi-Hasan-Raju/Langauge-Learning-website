CREATE TABLE "VocabularyExerciseSubmission" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userAnswer" TEXT NOT NULL,
    "isCorrect" BOOLEAN NOT NULL,
    "score" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VocabularyExerciseSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "VocabularyExerciseSubmission_userId_idx"
ON "VocabularyExerciseSubmission"("userId");

CREATE INDEX "VocabularyExerciseSubmission_exerciseId_idx"
ON "VocabularyExerciseSubmission"("exerciseId");

CREATE INDEX "VocabularyExerciseSubmission_userId_exerciseId_idx"
ON "VocabularyExerciseSubmission"("userId", "exerciseId");

ALTER TABLE "VocabularyExerciseSubmission"
ADD CONSTRAINT "VocabularyExerciseSubmission_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "VocabularyExerciseSubmission"
ADD CONSTRAINT "VocabularyExerciseSubmission_exerciseId_fkey"
FOREIGN KEY ("exerciseId") REFERENCES "VocabularyExercise"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
