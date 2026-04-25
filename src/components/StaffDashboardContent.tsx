"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardSection } from "../types/types";
import { useMediaQuery } from "../app/hooks/useMediaQuery";

import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import DirectorNotificationList from "./DirectorNotificationList";
import StudentListWithFilter from "./StudentListWithFilter";
import DirectorDocumentList from "./DirectorDocumentList";
import CenteredSpinner from "./CenteredSpinner";
import AccountSettings from "./AccountSettings";

export default function StaffDashboardContent() {
  const t = useTranslations("Dashboard");
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("eleves");

  useEffect(() => {
    const savedSection = localStorage.getItem("staffActiveSection");
    if (savedSection) {
      setActiveSection(savedSection as DashboardSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("staffActiveSection", activeSection);
  }, [activeSection]);

  if (status === "loading") return <CenteredSpinner label={t("loading")} />;
  if (!session || session.user.role !== "STAFF") redirect("/login");

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

        {activeSection === "notification" && <DirectorNotificationList />}
        {activeSection === "eleves" && <StudentListWithFilter />}
        {activeSection === "documents" && <DirectorDocumentList />}

        {activeSection === "settings" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("accountSettings")}
            </h2>
            <AccountSettings />
          </div>
        )}
      </main>
    </div>
  );
}
