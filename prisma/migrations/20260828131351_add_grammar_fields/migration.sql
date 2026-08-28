/*
  Warnings:

  - A unique constraint covering the columns `[grammarId,taskNo]` on the table `GrammarQuestion` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `taskNo` to the `GrammarQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GrammarQuestion" ADD COLUMN     "taskNo" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "GrammarTopic" ADD COLUMN     "commonMistakes" JSONB,
ADD COLUMN     "examples" JSONB,
ADD COLUMN     "rules" JSONB;

-- CreateIndex
CREATE UNIQUE INDEX "GrammarQuestion_grammarId_taskNo_key" ON "GrammarQuestion"("grammarId", "taskNo");
