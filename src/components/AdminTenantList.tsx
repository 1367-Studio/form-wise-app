"use client";

import useSWR from "swr";
import { Badge } from "@/components/ui/badge";
import CenteredSpinner from "./CenteredSpinner";
import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";

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

export default function AdminTenantList() {
  const t = useTranslations("AdminTenants");
  const { data, isLoading } = useSWR("/api/superadmin/tenants", fetcher);

  function getPlanBadge(
    plan: string,
    status?: "ACTIVE" | "FREE_TRIAL" | "EXPIRED"
  ) {
    if (status === "ACTIVE") {
      return (
        <Badge className="bg-green-100 text-green-800">
          {t("subscriptionActive")}
        </Badge>
      );
    }
    if (status === "EXPIRED") {
      return (
        <Badge className="bg-red-100 text-red-800">{t("expired")}</Badge>
      );
    }
    if (status === "FREE_TRIAL") {
      return (
        <Badge className="bg-yellow-500 text-white">{t("freeTrial")}</Badge>
      );
    }

    switch (plan) {
      case "MONTHLY":
        return (
          <Badge className="bg-green-600 text-white">{t("monthly")}</Badge>
        );
      case "YEARLY":
        return <Badge className="bg-blue-600 text-white">{t("annual")}</Badge>;
      default:
        return (
          <Badge className="bg-gray-400 text-white">{t("freeTrial")}</Badge>
        );
    }
  }

  if (isLoading) return <CenteredSpinner label={t("loading")} />;
  if (!data?.tenants) return <div>{t("loadError")}</div>;

  const tenants = data.tenants;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-6">{t("title")}</h1>

      <div className="hidden md:block overflow-auto rounded-lg border">
        <table className="min-w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-4 py-3">{t("headerSchoolNumber")}</th>
              <th className="px-4 py-3">{t("headerName")}</th>
              <th className="px-4 py-3">{t("headerDirector")}</th>
              <th className="px-4 py-3">{t("headerPlan")}</th>
              <th className="px-4 py-3">{t("headerCreatedAt")}</th>
              <th className="px-4 py-3 text-center">{t("headerActions")}</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {tenants.map((tenant: Tenant) => (
              <tr key={tenant.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-600 font-medium">
                  {tenant.schoolCode}
                </td>
                <td className="px-4 py-3">{tenant.name}</td>
                <td className="px-4 py-3">
                  {tenant.users.length > 0 ? (
                    <>
                      {tenant.users[0].firstName} {tenant.users[0].lastName}
                      <br />
                      <span className="text-xs text-gray-500">
                        {tenant.users[0].email}
                      </span>
                    </>
                  ) : (
                    <em className="text-gray-400">{t("noDirector")}</em>
                  )}
                </td>
                <td className="px-4 py-3">
                  {getPlanBadge(tenant.billingPlan, tenant.subscriptionStatus)}
                </td>
                <td className="px-4 py-3">
                  {new Date(tenant.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3  justify-center flex">
                  <button className="cursor-pointer">
                    <Eye className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-4">
        {tenants.map((tenant: Tenant) => (
          <div
            key={tenant.id}
            className="border rounded-xl p-4 shadow bg-white"
          >
            <div className="text-sm text-gray-500 mb-1">
              {t("schoolNumberLabel")} <strong>{tenant.uniqueNumber}</strong>
            </div>
            <div className="text-lg font-bold">{tenant.name}</div>
            <div className="text-sm mb-1">
              {t("directorLabel")}{" "}
              {tenant.users.length > 0 ? (
                <>
                  {tenant.users[0].firstName} {tenant.users[0].lastName}
                  <br />
                  <span className="text-xs text-gray-500">
                    {tenant.users[0].email}
                  </span>
                </>
              ) : (
                <em className="text-gray-400">{t("noDirector")}</em>
              )}
            </div>
            <div className="text-sm flex items-center gap-2 mb-1">
              <div className="text-sm flex items-center gap-2 mb-1">
                {t("planLabel")}{" "}
                {getPlanBadge(tenant.billingPlan, tenant.subscriptionStatus)}
              </div>
            </div>
            <div className="text-sm text-gray-600 mb-2">
              {t("createdAtLabel")}{" "}
              {new Date(tenant.createdAt).toLocaleDateString()}
            </div>
            <div className="text-right">
              <a
                href={`/admin/tenant/${tenant.id}`}
                className="text-sm text-blue-600 hover:underline"
              >
                {t("viewDetails")}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
