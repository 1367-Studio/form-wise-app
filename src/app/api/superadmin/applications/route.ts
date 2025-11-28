// app/api/superadmin/applications/route.ts

import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { Prisma, TenantApplication } from "@prisma/client"; // Imports Prisma types and enums

// Defines the school status enum (assuming it's the same as TenantApplication or similar)
// If 'ecole' is a different model, adjust the enum name according to your schema.prisma
// I will use 'PreRegistrationStatus' as a base, but the ideal would be to use the correct enum
// from the 'Ecole' model. For this example, I will keep the enum name from your code.
// Assuming the 'Ecole' model has a 'status' field of type PreRegistrationStatus.
import { PreRegistrationStatus } from "@prisma/client";

// Defines the interface for the selected fields (matching the 'selectFields' object)
// Using 'Partial<TenantApplication>' plus specific select fields is a common pattern.
type ApplicationSelect = Pick<
  TenantApplication,
  | "id"
  | "name"
  | "firstName"
  | "lastName"
  | "email"
  | "phone"
  | "siret"
  | "city"
  | "country"
  | "createdAt"
  | "status"
  | "validatedAt"
>;

// Defines the interface for the paginated response structure
interface PaginatedResponse {
  items: ApplicationSelect[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization: Only SUPER_ADMIN
  if (!session || session.user.role !== "SUPER_ADMIN") {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const searchParams = url.searchParams;

    // --- Pagination Parameters ---
    const defaultPageSize = 10;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSize = parseInt(
      searchParams.get("pageSize") || String(defaultPageSize),
      10
    );

    // Calculates 'skip' (offset) for Prisma
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    // --- Filtering and Search Parameters ---
    const statusQuery = searchParams.get("status");
    const searchQuery = searchParams.get("search");

    // 2. Construction of the WHERE Clause
    // Initializes the 'where' clause for Prisma
    const whereClause: Prisma.TenantApplicationWhereInput = {}; // Adjust the type if 'ecole' is a different model than 'TenantApplication'

    // 2.1. Filter by Status
    if (statusQuery) {
      const upperStatus = statusQuery.toUpperCase();

      // Validates if the status is 'PENDING' or 'ACCEPTED' (or another valid status)
      if (
        upperStatus === "PENDING" ||
        upperStatus === "ACCEPTED" // | upperStatus === "REJECTED" - Add if necessary
      ) {
        whereClause.status = upperStatus as PreRegistrationStatus;
      }
      // Note: If an invalid status is passed, the 'status' filter will be ignored,
      // returning all schools that match the other filters.
    }

    // 2.2. Search Filter
    if (searchQuery && searchQuery.length >= 3) {
      // Uses Prisma's OR operator to search the term in multiple fields
      // We will use 'contains' for partial search and 'mode: "insensitive"' to ignore case (PostgreSQL/MongoDB)
      whereClause.OR = [
        { name: { contains: searchQuery, mode: "insensitive" as const } },

        { siret: { contains: searchQuery, mode: "insensitive" as const } },

        { firstName: { contains: searchQuery, mode: "insensitive" as const } },

        { lastName: { contains: searchQuery, mode: "insensitive" as const } },
      ];
    }

    // Defines the fields to be selected for the return
    const selectFields = {
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
      status: true,
      validatedAt: true,
      // If 'Ecole' is the actual model, adjust the fields according to your schema
    };

    // 3. Executes the Queries (findMany and count) in a Transaction
    // Uses $transaction or Promise.all to ensure consistency and efficiency
    const [applications, totalItems] = await prisma.$transaction([
      // 3.1. Query to get the paginated data (items[])
      prisma.tenantApplication.findMany({
        // Replace 'tenantApplication' with the actual 'ecole' model
        where: whereClause,
        orderBy: {
          createdAt: "desc",
        },
        skip: skip,
        take: take,
        select: selectFields,
      }),
      // 3.2. Query to get the total count of items with the filter
      prisma.tenantApplication.count({
        // Replace 'tenantApplication' with the actual 'ecole' model
        where: whereClause,
      }),
    ]);

    // 4. Pagination Calculation
    const totalPages = Math.ceil(totalItems / pageSize);

    // 5. Response Return
    const response: PaginatedResponse = {
      items: applications,
      totalItems: totalItems,
      currentPage: page,
      totalPages: totalPages,
    };

    return NextResponse.json(response, { status: 200 });
  } catch (error) {
    console.error("Error listing ecôle applications with filters:", error);
    return NextResponse.json({ error: "Server error." }, { status: 500 });
  }
}
