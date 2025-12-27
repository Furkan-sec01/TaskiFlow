-- AlterTable: User tablosuna status ve verificationToken kolonlarını ekle
ALTER TABLE "User" ADD COLUMN "status" TEXT NOT NULL DEFAULT 'active';
ALTER TABLE "User" ADD COLUMN "verificationToken" TEXT;

-- Mevcut kullanıcıları active olarak işaretle
UPDATE "User" SET "status" = 'active' WHERE "status" IS NULL;

-- verificationToken için unique constraint ekle (NULL değerler için partial index)
CREATE UNIQUE INDEX "User_verificationToken_key" ON "User"("verificationToken") WHERE "verificationToken" IS NOT NULL;

-- Index ekle
CREATE INDEX "User_verificationToken_idx" ON "User"("verificationToken");
