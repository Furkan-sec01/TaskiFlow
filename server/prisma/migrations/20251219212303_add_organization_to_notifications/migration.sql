-- OrganizationId kolonunu önce nullable olarak ekle
ALTER TABLE "Notification" ADD COLUMN "organizationId" INTEGER;

-- Mevcut notification'ları default organization'a bağla (eğer varsa)
-- Önce bir default organization oluştur (eğer yoksa)
INSERT INTO "Organization" (name, "createdAt")
SELECT 'Default Organization', NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Organization" WHERE name = 'Default Organization');

-- Mevcut notification'ları default organization'a bağla
UPDATE "Notification"
SET "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization' LIMIT 1)
WHERE "organizationId" IS NULL;

-- Artık organizationId'yi NOT NULL yap
ALTER TABLE "Notification" ALTER COLUMN "organizationId" SET NOT NULL;

-- Index ekle
CREATE INDEX "Notification_organizationId_idx" ON "Notification"("organizationId");

-- Foreign key constraint ekle
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
