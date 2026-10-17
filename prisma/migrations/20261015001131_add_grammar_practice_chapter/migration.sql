-- Add a separate chapter assignment for grammar practice questions.
ALTER TABLE "GrammarQuestion"
ADD COLUMN "practiceChapterId" TEXT;

-- Preserve existing placement by keeping legacy questions with their topic's chapter.
UPDATE "GrammarQuestion" AS question
SET "practiceChapterId" = topic."chapterId"
FROM "GrammarTopic" AS topic
WHERE question."grammarId" = topic."id";

ALTER TABLE "GrammarQuestion"
ALTER COLUMN "practiceChapterId" SET NOT NULL;

DROP INDEX "GrammarQuestion_grammarId_taskNo_key";

CREATE UNIQUE INDEX "GrammarQuestion_grammarId_practiceChapterId_taskNo_key"
ON "GrammarQuestion"("grammarId", "practiceChapterId", "taskNo");

CREATE INDEX "GrammarQuestion_practiceChapterId_idx"
ON "GrammarQuestion"("practiceChapterId");

ALTER TABLE "GrammarQuestion"
ADD CONSTRAINT "GrammarQuestion_practiceChapterId_fkey"
FOREIGN KEY ("practiceChapterId") REFERENCES "Chapter"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
