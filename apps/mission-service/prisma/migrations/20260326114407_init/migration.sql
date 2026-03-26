/*
  Warnings:

  - You are about to drop the `MissionDate` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "MissionType" AS ENUM ('STATIC', 'FLIGHT');

-- DropTable
DROP TABLE "MissionDate";

-- DropEnum
DROP TYPE "MisionType";

-- DropEnum
DROP TYPE "MissionStatus";

-- CreateTable
CREATE TABLE "MissionData" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "Type" "MissionType" NOT NULL,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLon" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION,
    "endLon" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "radius" DOUBLE PRECISION,
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionData_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissionData_name_key" ON "MissionData"("name");
