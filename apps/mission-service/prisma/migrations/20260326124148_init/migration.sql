/*
  Warnings:

  - You are about to drop the column `name` on the `MissionData` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "MissionData_name_key";

-- AlterTable
ALTER TABLE "MissionData" DROP COLUMN "name",
ALTER COLUMN "endDate" DROP NOT NULL;
