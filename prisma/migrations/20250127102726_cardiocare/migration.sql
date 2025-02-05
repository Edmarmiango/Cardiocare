-- AlterTable
ALTER TABLE "User" ADD COLUMN     "googleFitAccessToken" TEXT,
ADD COLUMN     "googleFitRefreshToken" TEXT,
ADD COLUMN     "googleFitTokenExpiry" TIMESTAMP(3);
