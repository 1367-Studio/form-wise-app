import { prisma } from "../../../../lib/prisma";
import { authOptions } from "../../../../lib/authOptions";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { BillingPlan } from "@prisma/client";

// Defines the expected structure for the monthly data (BarChart)
interface MonthlyStat {
  name: string; // Month name (e.g., "Jan", "Fév")
  schools: number; // Number of schools registered that month
}

// Defines the expected structure for the plan distribution
interface PlanDistribution {
  [key: string]: number; // Key is the BillingPlan, value is the count
}

// Defines the complete response structure
interface AdminStatsResponse {
  monthlyRegistrations: MonthlyStat[];
  planDistribution: PlanDistribution;
}

// Helper to get month name in French (matches the mockData)
const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    "Jan",
    "Fév",
    "Mars",
    "Avr",
    "Mai",
    "Juin",
    "Juil",
    "Août",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  return monthNames[monthIndex];
};

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  // 1. Authorization: Only SUPER_ADMIN
  if (!session || session.user.role !== "SUPER_ADMIN") {
    // Message d'erreur pour l'utilisateur
    return new NextResponse("Non autorisé", { status: 401 });
  }

  try {
    // 2. 🎣 Extract the year parameter from the request URL
    const url = new URL(req.url);
    const yearParam = url.searchParams.get("year");

    // Converts to number. If invalid or missing, uses the current year.
    const requestedYear = yearParam
      ? parseInt(yearParam, 10)
      : new Date().getFullYear();

    // Only one query: fetch all Tenants
    // Note: The year filter is applied in the JS code, not the Prisma query,
    // because the plan distribution calculation needs ALL tenants.
    const allTenants = await prisma.tenant.findMany({
      select: {
        billingPlan: true,
        createdAt: true,
      },
    });

    // --- Calculation 1: Monthly Registrations (BarChart Data) ---
    const currentYear = requestedYear; // Now uses the requested year

    // 1. Initializes a Map to store counts, ensuring order
    const monthlyMap = new Map<string, number>();
    const monthOrder = getMonthName;

    // 2. Populates the Map with all 12 months of the requested year with zero count (0)
    for (let i = 0; i < 12; i++) {
      monthlyMap.set(monthOrder(i), 0);
    }

    // 3. Processes registration data to update the count
    allTenants.forEach((tenant) => {
      const date = tenant.createdAt;

      // ⚠️ APPLICATION OF THE YEAR FILTER HERE
      if (date && date.getFullYear() === currentYear) {
        const monthIndex = date.getMonth(); // 0 (Jan) to 11 (Dec)
        const monthKey = monthOrder(monthIndex);

        // Increments the count for the month
        monthlyMap.set(monthKey, (monthlyMap.get(monthKey) || 0) + 1);
      }
    });

    // 4. Converts the Map to the required array format (MonthlyStat[])
    const monthlyRegistrations: MonthlyStat[] = Array.from(
      monthlyMap,
      ([name, schools]) => ({
        name,
        schools,
      })
    );

    // --- Calculation 2: Plan Distribution ---
    // This distribution is NOT filtered by year, as it represents the current status of all active tenants.
    const planDistribution: PlanDistribution = {
      [BillingPlan.FREE_TRIAL]: 0,
      [BillingPlan.MONTHLY]: 0,
      [BillingPlan.YEARLY]: 0,
    };

    allTenants.forEach((tenant) => {
      const plan = tenant.billingPlan;
      if (plan in planDistribution) {
        planDistribution[plan]! += 1;
      }
    });

    // 4. Response Return
    const response: AdminStatsResponse = {
      monthlyRegistrations,
      planDistribution,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        "Cache-Control": "no-store", // Ensures that cached data is not used
      },
    });
  } catch (error) {
    // Log de erro pour le développeur (en français)
    console.error(
      `Erreur lors de la récupération des statistiques SuperAdmin pour l'année ${new Date().getFullYear()} :`,
      error
    );
    // Message d'erreur pour l'utilisateur
    return NextResponse.json({ error: "Erreur serveur." }, { status: 500 });
  }
}
