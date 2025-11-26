// app/api/superadmin/applications/route.ts

import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";

// Import the Prisma enum to ensure correct typing and status validation
import { PreRegistrationStatus } from "@prisma/client";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization Check
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    // 2. Get status from query parameters
    const url = new URL(req.url);
    const statusQuery = url.searchParams.get("status");

    let filterStatus: PreRegistrationStatus | undefined = undefined;

    // Validate the status from the query parameter
    if (statusQuery) {
      // Convert the status to uppercase to ensure consistency (e.g., PENDING)
      const upperStatus = statusQuery.toUpperCase();

      // Check if the provided value is a valid status (PENDING, ACCEPTED, REJECTED)
      if (
        Object.values(PreRegistrationStatus).includes(
          upperStatus as PreRegistrationStatus
        )
      ) {
        filterStatus = upperStatus as PreRegistrationStatus;
      }
    }

    // Define the filter for Prisma. If no valid status is provided,
    // list all applications (or set a default, like PENDING).
    const whereClause = filterStatus ? { status: filterStatus } : {};

    // 3. List applications based on the filter
    const applications = await prisma.tenantApplication.findMany({
      where: whereClause, // Apply the filter (e.g., { status: 'PENDING' } or {})

      orderBy: {
        createdAt: "desc", // Order by creation date
      },

      select: {
        id: true,
        name: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        siret: true,
        city: true,
        country: true,
        createdAt: true,
        status: true, // MUST include status in select
        rejectionReason: true, // Useful when status is REJECTED
        approvedById: true, // Useful to know who processed it
      },
    });

    // 4. Return the applications
    return NextResponse.json({ applications }, { status: 200 });
  } catch (error) {
    console.error("Error listing tenant applications with filter:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
