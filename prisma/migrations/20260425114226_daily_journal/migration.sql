-- CreateTable
CREATE TABLE "DailyJournal" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "classId" TEXT NOT NULL,
    "subjectId" TEXT,
    "teacherId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "classSummary" TEXT NOT NULL,
    "homework" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyJournal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalRead" (
    "id" TEXT NOT NULL,
    "journalId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "readAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "JournalRead_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyJournal_tenantId_classId_date_idx" ON "DailyJournal"("tenantId", "classId", "date");

-- CreateIndex
CREATE INDEX "DailyJournal_teacherId_date_idx" ON "DailyJournal"("teacherId", "date");

-- CreateIndex
CREATE INDEX "JournalRead_parentId_idx" ON "JournalRead"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "JournalRead_journalId_parentId_key" ON "JournalRead"("journalId", "parentId");

-- AddForeignKey
ALTER TABLE "JournalRead" ADD CONSTRAINT "JournalRead_journalId_fkey" FOREIGN KEY ("journalId") REFERENCES "DailyJournal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
