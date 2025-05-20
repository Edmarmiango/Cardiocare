/*
  Warnings:

  - You are about to drop the column `diastolic` on the `HealthData` table. All the data in the column will be lost.
  - You are about to drop the column `heartRate` on the `HealthData` table. All the data in the column will be lost.
  - You are about to drop the column `systolic` on the `HealthData` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "HealthData" DROP COLUMN "diastolic",
DROP COLUMN "heartRate",
DROP COLUMN "systolic",
ADD COLUMN     "bloodPressure" JSONB,
ALTER COLUMN "cholesterol" DROP NOT NULL,
ALTER COLUMN "glucose" DROP NOT NULL;
