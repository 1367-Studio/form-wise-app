"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "../app/hooks/useMediaQuery";
import { DashboardSection } from "../types/types";

import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import AdminTenantList from "./AdminTenantList";
import AdminCharts from "./AdminCharts";
import AdminKpiCards from "./AdminKpiCards";
import AdminActivityFeed from "./AdminActivityFeed";
import AdminConversionFunnel from "./AdminConversionFunnel";
import AdminBilling from "./AdminBilling";
import AdminFailedPayments from "./AdminFailedPayments";
import AdminBroadcast from "./AdminBroadcast";
import AdminImpersonate from "./AdminImpersonate";
import AdminAuditLog from "./AdminAuditLog";
import AccountSettings from "./AccountSettings";
import CenteredSpinner from "./CenteredSpinner";
import AdminHome from "./admin/AdminHome";
import AdminReports from "./admin/AdminReports";
import AdminActivityPage from "./admin/AdminActivityPage";
import AdminFunnelPage from "./admin/AdminFunnelPage";
import AdminHealthPage from "./admin/AdminHealthPage";
import AdminSecurityPage from "./admin/AdminSecurityPage";
import AdminConfigPage from "./admin/AdminConfigPage";

export default function SuperAdminDashboardContent() {
  const t = useTranslations("Dashboard");
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("adminHome");

  useEffect(() => {
    const savedSection = localStorage.getItem("superAdminActiveSection");
    if (savedSection) {
      setActiveSection(savedSection as DashboardSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("superAdminActiveSection", activeSection);
  }, [activeSection]);

  if (status === "loading") return <CenteredSpinner label={t("loading")} />;
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

  const fullName = `${session.user.firstName} ${session.user.lastName}`.trim();

  return (
    <div className="flex min-h-screen">
      {isMobile ? (
        <MobileSidebar
          activeSection={activeSection}
          setActiveSectionAction={setActiveSection}
        />
      ) : (
        <Sidebar
          activeSection={activeSection}
          setActiveSectionAction={setActiveSection}
        />
      )}

      <main className="flex-1 p-6 mt-10 md:mt-0">
        <p className="mb-6">{t("welcome", { name: fullName })}</p>

        {activeSection === "adminHome" && <AdminHome />}
        {activeSection === "adminReports" && <AdminReports />}
        {activeSection === "adminActivity" && <AdminActivityPage />}
        {activeSection === "adminFunnel" && <AdminFunnelPage />}
        {activeSection === "adminHealth" && <AdminHealthPage />}
        {activeSection === "adminSecurity" && <AdminSecurityPage />}
        {activeSection === "adminConfig" && <AdminConfigPage />}

        {activeSection === "tenants" && (
          <div className="space-y-8">
            <AdminKpiCards />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2">
                <AdminTenantList />
              </div>
              <div className="lg:col-span-1">
                <AdminActivityFeed />
              </div>
            </div>
          </div>
        )}
        {activeSection === "chartsAdmin" && (
          <div className="space-y-8">
            <AdminKpiCards />
            <div className="grid gap-6 lg:grid-cols-2">
              <AdminConversionFunnel />
              <AdminActivityFeed />
            </div>
            <AdminCharts />
          </div>
        )}
        {activeSection === "billingAdmin" && <AdminBilling />}
        {activeSection === "failedPaymentsAdmin" && <AdminFailedPayments />}
        {activeSection === "broadcastAdmin" && <AdminBroadcast />}
        {activeSection === "impersonateAdmin" && <AdminImpersonate />}
        {activeSection === "auditAdmin" && <AdminAuditLog />}
        {activeSection === "settingsAdmin" && (
          <>
            <h2 className="text-xl font-semibold mb-4">
              {t("accountSettings")}
            </h2>
            <AccountSettings />
          </>
        )}
      </main>
    </div>
  );
}
