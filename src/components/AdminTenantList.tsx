"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import CenteredSpinner from "./CenteredSpinner";
import { Eye } from "lucide-react";
import { DataTable } from "@/components/ui/datatable";
import { ActionButton } from "@/components/ui/action-button";
import { DataCard } from "@/components/ui/datacard";

type Tenant = {
  id: string;
  name: string;
  uniqueNumber: string;
  billingPlan: string;
  createdAt: string;
  plan: string;
  subscriptionStatus?: "FREE_TRIAL" | "ACTIVE" | "EXPIRED";
  schoolCode: string;
  users: {
    firstName: string;
    lastName: string;
    email: string;
  }[];
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

function getPlanBadge(
  plan: string,
  status?: "ACTIVE" | "FREE_TRIAL" | "EXPIRED"
) {
  if (status === "ACTIVE") {
    return (
      <Badge className="bg-green-100 text-green-800">Abonnement actif</Badge>
    );
  }
  if (status === "EXPIRED") {
    return <Badge className="bg-red-100 text-red-800">Expiré</Badge>;
  }
  if (status === "FREE_TRIAL") {
    return <Badge className="bg-yellow-500 text-white">Essai gratuit</Badge>;
  }

  switch (plan) {
    case "MONTHLY":
      return <Badge className="bg-green-600 text-white">Mensuel</Badge>;
    case "YEARLY":
      return <Badge className="bg-blue-600 text-white">Annuel</Badge>;
    default:
      return <Badge className="bg-gray-400 text-white">Essai gratuit</Badge>;
  }
}

export default function AdminTenantList() {
  const { data, isLoading } = useSWR("/api/superadmin/tenants", fetcher);

  if (isLoading) return <CenteredSpinner label="Chargement des écoles..." />;
  if (!data?.tenants) return <div>Erreur lors du chargement.</div>;

  const tenants = data.tenants;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">
        Dashboard Admin – Établissements
      </h1>

      {/* TABLEAU DESKTOP */}
      <DataTable
        data={tenants}
        columns={[
          {
            header: "N° École",
            accessor: "schoolCode",
          },

          {
            header: "Nom",
            render: (tenant: Tenant) => <div>{tenant.name}</div>,
          },

          {
            header: "Directeur",
            render: (tenant) =>
              tenant.users.length > 0 ? (
                <div>
                  {tenant.users[0].firstName} {tenant.users[0].lastName}
                  <br />
                  <span className="text-xs text-gray-500">
                    {tenant.users[0].email}
                  </span>
                </div>
              ) : (
                <em className="text-gray-400 text-sm">Non défini</em>
              ),
          },

          {
            header: "Plan",
            render: (tenant) =>
              getPlanBadge(tenant.billingPlan, tenant.subscriptionStatus),
          },

          {
            header: "Créé le",
            render: (tenant) => new Date(tenant.createdAt).toLocaleDateString(),
          },

          {
            header: "Actions",
            className: "text-center",
            render: () => (
              <div className="flex justify-center">
                <ActionButton
                  onClick={() => console.log("")}
                  disabled={false}
                  loading={false}
                  title="Voir les détails"
                  icon={
                    <Eye className="w-5 h-5 text-gray-600 hover:text-gray-800" />
                  }
                />
              </div>
            ),
          },
        ]}
      />

      {/* CARTES MOBILE */}
      <DataCard
        data={tenants}
        fields={[
          {
            key: "uniqueNumber",
            label: "N° École",
            render: (tenant) => (
              <div className="text-sm text-gray-500 mb-1">
                {tenant.uniqueNumber}
              </div>
            ),
          },
          {
            key: "name",
            render: (tenant: Tenant) => (
              <div className="text-lg font-bold">{tenant.name}</div>
            ),
          },
          {
            key: "director",
            label: "Directeur",
            render: (tenant) =>
              tenant.users.length > 0 ? (
                <div className="text-sm mb-1">
                  {tenant.users[0].firstName} {tenant.users[0].lastName}
                  <br />
                  <span className="text-xs text-gray-500">
                    {tenant.users[0].email}
                  </span>
                </div>
              ) : (
                <em className="text-gray-400 text-sm">Non défini</em>
              ),
          },
          {
            key: "plan",
            label: "Plan",
            render: (tenant) => (
              <div className="text-sm flex items-center gap-2 mb-1">
                {getPlanBadge(tenant.billingPlan, tenant.subscriptionStatus)}
              </div>
            ),
          },
          {
            key: "createdAt",
            label: "Créé le",
            render: (tenant) => (
              <div className="text-sm text-gray-600 mb-2">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </div>
            ),
          },
          {
            key: "actions",
            render: (tenant) => (
              <div className="text-right">
                <a
                  href={`/admin/tenant/${tenant.id}`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Voir les détails →
                </a>
              </div>
            ),
          },
        ]}
      />
    </div>
  );
}
