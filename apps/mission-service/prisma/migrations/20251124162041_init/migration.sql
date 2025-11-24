-- CreateEnum
CREATE TYPE "MisionType" AS ENUM ('STATIC', 'FLIGHT');

-- CreateEnum
CREATE TYPE "MissionStatus" AS ENUM ('DRAFT', 'PENDING', 'COMPLETED', 'FAILED');

-- CreateTable
CREATE TABLE "MissionDate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "Type" "MissionStatus" NOT NULL,
    "startLat" DOUBLE PRECISION NOT NULL,
    "startLon" DOUBLE PRECISION NOT NULL,
    "endLat" DOUBLE PRECISION,
    "endLon" DOUBLE PRECISION,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "radius" DOUBLE PRECISION,
    "status" "MissionStatus" NOT NULL DEFAULT 'DRAFT',
    "result" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MissionDate_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MissionDate_name_key" ON "MissionDate"("name");
