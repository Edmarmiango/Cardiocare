/*
  Warnings:

  - You are about to drop the column `bloodPressure` on the `HealthData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HealthData" DROP COLUMN "bloodPressure",
ADD COLUMN     "diastolic" INTEGER,
ADD COLUMN     "heartRate" INTEGER,
ADD COLUMN     "systolic" INTEGER;
