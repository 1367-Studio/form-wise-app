"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useMediaQuery } from "../app/hooks/useMediaQuery";
import { DashboardSection } from "../types/types";

import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import AdminTenantList from "./AdminTenantList";
import AdminCharts from "./AdminCharts";
import AccountSettings from "./AccountSettings";
import CenteredSpinner from "./CenteredSpinner";
import AdminTenantRequestsPage from "./AdminTenantRequestsPage";
import InternalSchoolRegisterPage from "./InternalSchoolRegisterPage";

export default function SuperAdminDashboardContent() {
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("tenants");

  useEffect(() => {
    const savedSection = localStorage.getItem("superAdminActiveSection");
    if (savedSection) {
      setActiveSection(savedSection as DashboardSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("superAdminActiveSection", activeSection);
  }, [activeSection]);

  if (status === "loading") return <CenteredSpinner label="Chargement..." />;
  if (!session || session.user.role !== "SUPER_ADMIN") redirect("/login");

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
        <p className="mb-6">
          Bienvenue, {session.user.firstName} {session.user.lastName}
        </p>
        {activeSection === "schoolRegistrationAdmin" && (
          <InternalSchoolRegisterPage />
        )}
        {activeSection === "requestsAdmin" && <AdminTenantRequestsPage />}
        {activeSection === "tenants" && <AdminTenantList />}
        {activeSection === "chartsAdmin" && <AdminCharts />}
        {activeSection === "settingsAdmin" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Paramètres du compte</h2>
            <AccountSettings />
          </>
        )}
      </main>
    </div>
  );
}
