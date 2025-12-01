"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertCircle } from "lucide-react";
import CenteredSpinner from "./CenteredSpinner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"; // 1. SELECT IMPORT

// --- Types to match the backend response ---

// Type for monthly data
interface MonthlyStat {
  name: string;
  schools: number;
}

// Type for plan distribution
interface PlanDistribution {
  FREE_TRIAL: number;
  MONTHLY: number;
  YEARLY: number;
}

// Type for the complete API response
interface AdminStatsResponse {
  monthlyRegistrations: MonthlyStat[];
  planDistribution: PlanDistribution;
}

// Mapping of plan names (Enum keys) to French labels and colors
const planMap = {
  FREE_TRIAL: {
    label: "Essai gratuit",
    color: "text-yellow-500", // 🟡
    key: "🟡 Essai gratuit",
  },
  MONTHLY: {
    label: "Mensuel",
    color: "text-green-500", // 🟢
    key: "🟢 Mensuel",
  },
  YEARLY: {
    label: "Annuel",
    color: "text-blue-500", // 🔵
    key: "🔵 Annuel",
  },
};

const STATS_API_URL = "/api/superadmin/stats";

export default function AdminCharts() {
  const currentYear = new Date().getFullYear();
  const [data, setData] = useState<AdminStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 3. STATE FOR THE SELECTED YEAR (default: current year)
  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));

  // 2. GENERATION OF THE LIST OF YEARS
  const availableYears = useMemo(() => {
    // Lists years, for example, from the current year up to 3 years ago
    const years = [];
    for (let year = currentYear; year >= currentYear - 3; year--) {
      years.push(String(year));
    }
    return years;
  }, [currentYear]);

  // Fetches statistics from the backend, including the selected year as a query parameter
  const fetchStats = useCallback(async (year: string) => {
    setLoading(true);
    setError(null);
    let attempts = 0;
    const maxAttempts = 3;

    // 4. Constructs the URL with the year parameter
    const url = `${STATS_API_URL}${year ? `?year=${year}` : ""}`;

    while (attempts < maxAttempts) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok) {
          // Error message kept in French as it's part of the application flow
          throw new Error(`Erreur HTTP! Statut: ${response.status}`);
        }

        const result: AdminStatsResponse = await response.json();
        setData(result);

        setLoading(false);
        return; // Success
      } catch (e) {
        attempts++;
        if (attempts >= maxAttempts) {
          // Console log kept in French
          console.error(
            "Erreur lors de la récupération des statistiques SuperAdmin :",
            e
          );
          // Error state message kept in French (visible to user)
          setError("Échec du chargement des données. Veuillez réessayer.");
          setLoading(false);
          return;
        }
        const delay = Math.pow(2, attempts) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }, []);

  useEffect(() => {
    // Triggers the fetch whenever selectedYear changes
    fetchStats(selectedYear);
  }, [fetchStats, selectedYear]);

  // Renders error message in a styled box
  const renderError = () => (
    <div className="flex flex-col justify-center items-center h-full min-h-[250px] text-red-600 bg-red-50 p-4 rounded-lg">
      <AlertCircle className="h-6 w-6 mb-2" />
      <p className="text-sm font-medium">{error}</p>
    </div>
  );

  // Loading or error handling view
  if (loading || error) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Écoles inscrites par mois
            </h2>
            {loading ? <CenteredSpinner fullScreen={false} /> : renderError()}
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">
              Répartition des plans
            </h2>
            {loading ? <CenteredSpinner fullScreen={false} /> : renderError()}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Check if monthly data is empty
  const monthlyEmpty = data?.monthlyRegistrations.length === 0;

  // Check if plan distribution data is empty (all counts are 0)
  const planEmpty =
    !data?.planDistribution ||
    Object.values(data.planDistribution).every((v) => v === 0);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Bar Chart Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Écoles inscrites par mois</h2>
            {/* 5. YEAR SELECT RENDER */}
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sélectionner l'année" />
              </SelectTrigger>
              <SelectContent>
                {availableYears.map((year) => (
                  <SelectItem key={year} value={year}>
                    Année {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {monthlyEmpty ? (
            <p className="text-gray-500 text-sm italic">
              Aucune donnée trouvée pour l`&apos;`année {selectedYear}.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart
                data={data?.monthlyRegistrations || []}
                margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
              >
                <XAxis
                  dataKey="name"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <YAxis
                  allowDecimals={false}
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                />
                <Tooltip
                  cursor={{ fill: "rgba(37, 99, 235, 0.1)" }}
                  contentStyle={{
                    borderRadius: "8px",
                    fontSize: "14px",
                    padding: "8px",
                    boxShadow:
                      "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: number) => [
                    `${value} écoles`,
                    "Inscriptions",
                  ]}
                  labelFormatter={(name) => `Mois: ${name}`}
                />
                <Bar
                  dataKey="schools"
                  fill="#2563eb"
                  radius={[4, 4, 0, 0]}
                  name="Écoles"
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Plan Distribution List Card */}
      <Card className="shadow-sm">
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Répartition des plans</h2>

          {planEmpty ? (
            <p className="text-gray-500 text-sm italic">
              Aucune donnée trouvée pour le moment.
            </p>
          ) : (
            <ul className="space-y-3 text-base font-medium">
              {Object.entries(data?.planDistribution || {}).map(
                ([key, count]) => {
                  const planInfo = planMap[key as keyof PlanDistribution];
                  if (!planInfo) return null;

                  return (
                    <li key={key} className="flex items-center">
                      <span className={`${planInfo.color} text-xl mr-3`}>
                        {key === "FREE_TRIAL"
                          ? "🟡"
                          : key === "MONTHLY"
                            ? "🟢"
                            : "🔵"}
                      </span>
                      {planInfo.label}:{" "}
                      <span className="font-semibold ml-2 text-gray-900">
                        {count} écoles
                      </span>
                    </li>
                  );
                }
              )}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
