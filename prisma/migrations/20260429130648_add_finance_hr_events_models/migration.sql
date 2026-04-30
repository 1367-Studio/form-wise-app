-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CHEQUE', 'CASH', 'DIRECT_DEBIT', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractType" AS ENUM ('CDI', 'CDD', 'STAGE', 'FREELANCE', 'OTHER');

-- CreateEnum
CREATE TYPE "ContractStatus" AS ENUM ('ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'TERMINATED');

-- CreateTable
CREATE TABLE "Invoice" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" "InvoiceStatus" NOT NULL DEFAULT 'PENDING',
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidAt" TIMESTAMP(3),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Invoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reminder" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL DEFAULT 'EMAIL',
    "notes" TEXT,

    CONSTRAINT "Reminder_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffContract" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "type" "ContractType" NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "hoursPerWeek" DOUBLE PRECISION,
    "salary" DOUBLE PRECISION,
    "status" "ContractStatus" NOT NULL DEFAULT 'ACTIVE',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffContract_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffHoursLog" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "overtime" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffHoursLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchoolEvent" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "type" TEXT NOT NULL DEFAULT 'GENERAL',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SchoolEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Invoice_tenantId_status_idx" ON "Invoice"("tenantId", "status");

-- CreateIndex
CREATE INDEX "Invoice_tenantId_dueDate_idx" ON "Invoice"("tenantId", "dueDate");

-- CreateIndex
CREATE INDEX "Invoice_studentId_idx" ON "Invoice"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_tenantId_number_key" ON "Invoice"("tenantId", "number");

-- CreateIndex
CREATE INDEX "Payment_tenantId_paidAt_idx" ON "Payment"("tenantId", "paidAt");

-- CreateIndex
CREATE INDEX "Payment_invoiceId_idx" ON "Payment"("invoiceId");

-- CreateIndex
CREATE INDEX "Reminder_tenantId_sentAt_idx" ON "Reminder"("tenantId", "sentAt");

-- CreateIndex
CREATE INDEX "Reminder_invoiceId_idx" ON "Reminder"("invoiceId");

-- CreateIndex
CREATE INDEX "StaffContract_tenantId_status_idx" ON "StaffContract"("tenantId", "status");

-- CreateIndex
CREATE INDEX "StaffContract_staffId_idx" ON "StaffContract"("staffId");

-- CreateIndex
CREATE INDEX "StaffHoursLog_tenantId_date_idx" ON "StaffHoursLog"("tenantId", "date");

-- CreateIndex
CREATE INDEX "StaffHoursLog_staffId_date_idx" ON "StaffHoursLog"("staffId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "StaffHoursLog_staffId_date_key" ON "StaffHoursLog"("staffId", "date");

-- CreateIndex
CREATE INDEX "SchoolEvent_tenantId_startDate_idx" ON "SchoolEvent"("tenantId", "startDate");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reminder" ADD CONSTRAINT "Reminder_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffContract" ADD CONSTRAINT "StaffContract_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffContract" ADD CONSTRAINT "StaffContract_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffHoursLog" ADD CONSTRAINT "StaffHoursLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffHoursLog" ADD CONSTRAINT "StaffHoursLog_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "Staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchoolEvent" ADD CONSTRAINT "SchoolEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
