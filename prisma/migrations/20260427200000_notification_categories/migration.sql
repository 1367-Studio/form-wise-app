-- CreateEnum
CREATE TYPE "NotificationCategory" AS ENUM ('GENERAL', 'ANNOUNCEMENT', 'ACADEMIC', 'ATTENDANCE', 'BILLING', 'EVENT', 'HEALTH', 'ADMIN');

-- AlterTable
ALTER TABLE "Notification" ADD COLUMN "category" "NotificationCategory" NOT NULL DEFAULT 'GENERAL';

-- CreateIndex
CREATE INDEX "Notification_tenantId_category_createdAt_idx" ON "Notification"("tenantId", "category", "createdAt");
