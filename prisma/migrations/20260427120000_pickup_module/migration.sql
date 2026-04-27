-- CreateTable
CREATE TABLE "PickupAuthorization" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "relationship" TEXT,
    "phone" TEXT,
    "notes" TEXT,
    "photoUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdByUserId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PickupAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PickupEvent" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorizationId" TEXT,
    "pickupName" TEXT,
    "loggedByUserId" TEXT NOT NULL,
    "notes" TEXT,

    CONSTRAINT "PickupEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PickupAuthorization_studentId_idx" ON "PickupAuthorization"("studentId");
CREATE INDEX "PickupAuthorization_tenantId_idx" ON "PickupAuthorization"("tenantId");
CREATE INDEX "PickupAuthorization_expiresAt_idx" ON "PickupAuthorization"("expiresAt");

-- CreateIndex
CREATE INDEX "PickupEvent_studentId_occurredAt_idx" ON "PickupEvent"("studentId", "occurredAt");
CREATE INDEX "PickupEvent_tenantId_occurredAt_idx" ON "PickupEvent"("tenantId", "occurredAt");

-- AddForeignKey
ALTER TABLE "PickupAuthorization" ADD CONSTRAINT "PickupAuthorization_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PickupAuthorization" ADD CONSTRAINT "PickupAuthorization_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PickupAuthorization" ADD CONSTRAINT "PickupAuthorization_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PickupEvent" ADD CONSTRAINT "PickupEvent_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PickupEvent" ADD CONSTRAINT "PickupEvent_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "PickupEvent" ADD CONSTRAINT "PickupEvent_authorizationId_fkey" FOREIGN KEY ("authorizationId") REFERENCES "PickupAuthorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PickupEvent" ADD CONSTRAINT "PickupEvent_loggedByUserId_fkey" FOREIGN KEY ("loggedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
