/*
  Warnings:

  - You are about to drop the column `description` on the `Ausbildung` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `Ausbildung` table. All the data in the column will be lost.
  - Added the required column `shortDescription` to the `Ausbildung` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Ausbildung_name_key";

-- DropIndex
DROP INDEX "Ausbildung_slug_key";

-- AlterTable
ALTER TABLE "Ausbildung" DROP COLUMN "description",
DROP COLUMN "slug",
ADD COLUMN     "shortDescription" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "AusbildungApplicationDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ausbildungId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AusbildungApplicationDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AusbildungVisaDocument" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL DEFAULT 0,
    "ausbildungId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AusbildungVisaDocument_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AusbildungApplicationDocument_ausbildungId_idx" ON "AusbildungApplicationDocument"("ausbildungId");

-- CreateIndex
CREATE INDEX "AusbildungApplicationDocument_ausbildungId_order_idx" ON "AusbildungApplicationDocument"("ausbildungId", "order");

-- CreateIndex
CREATE INDEX "AusbildungVisaDocument_ausbildungId_idx" ON "AusbildungVisaDocument"("ausbildungId");

-- CreateIndex
CREATE INDEX "AusbildungVisaDocument_ausbildungId_order_idx" ON "AusbildungVisaDocument"("ausbildungId", "order");

-- AddForeignKey
ALTER TABLE "AusbildungApplicationDocument" ADD CONSTRAINT "AusbildungApplicationDocument_ausbildungId_fkey" FOREIGN KEY ("ausbildungId") REFERENCES "Ausbildung"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AusbildungVisaDocument" ADD CONSTRAINT "AusbildungVisaDocument_ausbildungId_fkey" FOREIGN KEY ("ausbildungId") REFERENCES "Ausbildung"("id") ON DELETE CASCADE ON UPDATE CASCADE;
