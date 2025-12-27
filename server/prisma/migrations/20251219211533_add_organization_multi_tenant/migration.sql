-- CreateTable: Önce Organization tablosunu oluştur
CREATE TABLE "Organization" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- Mevcut kullanıcılar için default organization oluştur
INSERT INTO "Organization" (name, "createdAt")
VALUES ('Default Organization', NOW())
ON CONFLICT DO NOTHING;

-- OrganizationId kolonunu önce nullable olarak ekle
ALTER TABLE "User" ADD COLUMN "organizationId" INTEGER;

-- Mevcut kullanıcıları default organization'a bağla
UPDATE "User"
SET "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization' LIMIT 1)
WHERE "organizationId" IS NULL;

-- Her kullanıcı için ayrı organization oluştur (daha iyi izolasyon için)
DO $$
DECLARE
    user_record RECORD;
    org_id INTEGER;
BEGIN
    FOR user_record IN SELECT id, name, email FROM "User" WHERE "organizationId" = (SELECT id FROM "Organization" WHERE name = 'Default Organization' LIMIT 1)
    LOOP
        -- Her kullanıcı için yeni organization oluştur
        INSERT INTO "Organization" (name, "createdAt")
        VALUES (COALESCE(user_record.name, user_record.email) || '''s Team', NOW())
        RETURNING id INTO org_id;
        
        -- Kullanıcıyı yeni organization'a bağla
        UPDATE "User"
        SET "organizationId" = org_id
        WHERE id = user_record.id;
    END LOOP;
END $$;

-- Artık organizationId'yi NOT NULL yap
ALTER TABLE "User" ALTER COLUMN "organizationId" SET NOT NULL;

-- Index ekle
CREATE INDEX "User_organizationId_idx" ON "User"("organizationId");

-- Foreign key constraint ekle
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
