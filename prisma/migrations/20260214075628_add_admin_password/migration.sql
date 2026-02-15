-- AlterTable
ALTER TABLE "SiteConfig" ADD COLUMN "adminPasswordHash" TEXT;
ALTER TABLE "SiteConfig" ADD COLUMN "adminPasswordSalt" TEXT;
