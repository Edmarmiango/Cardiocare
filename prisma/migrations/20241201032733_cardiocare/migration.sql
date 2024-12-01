/*
  Warnings:

  - You are about to drop the column `bloodPressure` on the `HealthData` table. All the data in the column will be lost.
  - Added the required column `cholesterol` to the `HealthData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `diastolic` to the `HealthData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `glucose` to the `HealthData` table without a default value. This is not possible if the table is not empty.
  - Added the required column `systolic` to the `HealthData` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "HealthData" DROP COLUMN "bloodPressure",
ADD COLUMN     "cholesterol" INTEGER NOT NULL,
ADD COLUMN     "diastolic" INTEGER NOT NULL,
ADD COLUMN     "glucose" INTEGER NOT NULL,
ADD COLUMN     "systolic" INTEGER NOT NULL;
