/*
  Warnings:

  - You are about to drop the `Service` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('GENERAL', 'EXAM');

-- DropTable
DROP TABLE "Service";

-- CreateTable
CREATE TABLE "OurService" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "type" "ServiceType" NOT NULL DEFAULT 'GENERAL',
    "examName" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OurService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OurMember" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "role" TEXT,
    "shortDescription" TEXT NOT NULL,
    "imageUrl" TEXT,
    "imagePublicId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OurMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OurService_order_idx" ON "OurService"("order");

-- CreateIndex
CREATE INDEX "OurService_active_idx" ON "OurService"("active");

-- CreateIndex
CREATE INDEX "OurService_type_idx" ON "OurService"("type");

-- CreateIndex
CREATE INDEX "OurMember_order_idx" ON "OurMember"("order");

-- CreateIndex
CREATE INDEX "OurMember_active_idx" ON "OurMember"("active");

-- CreateIndex
CREATE INDEX "OurMember_language_idx" ON "OurMember"("language");
