-- Assign existing vocabulary exercises to their vocabulary item's chapter.
ALTER TABLE "VocabularyExercise"
ADD COLUMN "chapterId" TEXT;

UPDATE "VocabularyExercise" AS exercise
SET "chapterId" = vocabulary."chapterId"
FROM "Vocabulary" AS vocabulary
WHERE exercise."vocabularyId" = vocabulary."id";

ALTER TABLE "VocabularyExercise"
ALTER COLUMN "chapterId" SET NOT NULL,
ALTER COLUMN "vocabularyId" DROP NOT NULL;

CREATE INDEX "VocabularyExercise_chapterId_idx"
ON "VocabularyExercise"("chapterId");

ALTER TABLE "VocabularyExercise"
ADD CONSTRAINT "VocabularyExercise_chapterId_fkey"
FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
