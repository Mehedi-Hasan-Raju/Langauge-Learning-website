/*
  Warnings:

  - You are about to drop the `VisaCategory` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "VisaChecklistItem" DROP CONSTRAINT "VisaChecklistItem_categoryId_fkey";

-- DropTable
DROP TABLE "VisaCategory";

-- CreateTable
CREATE TABLE "VisaChecklistCategory" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VisaChecklistCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "VisaChecklistCategory_order_idx" ON "VisaChecklistCategory"("order");

-- AddForeignKey
ALTER TABLE "VisaChecklistItem" ADD CONSTRAINT "VisaChecklistItem_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "VisaChecklistCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
