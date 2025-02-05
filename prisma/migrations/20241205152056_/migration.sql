-- AlterTable
ALTER TABLE "Prescription" ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'ACTIVE';

-- CreateIndex
CREATE INDEX "Prescription_userId_idx" ON "Prescription"("userId");

-- CreateIndex
CREATE INDEX "Prescription_doctorId_idx" ON "Prescription"("doctorId");
