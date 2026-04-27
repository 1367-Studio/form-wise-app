"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardSection } from "../types/types";
import Sidebar from "../components/Sidebar";
import MobileSidebar from "../components/MobileSidebar";
import RIBForm from "components/RIBForm";
import { useMediaQuery } from "../app/hooks/useMediaQuery";
import CenteredSpinner from "./CenteredSpinner";
import AccountSettings from "./AccountSettings";
import ParentOverview from "./ParentOverview";
import ParentChildrenSection from "./ParentChildrenSection";
import ParentNotificationsSection from "./ParentNotificationsSection";
import ParentDocumentsSection from "./ParentDocumentsSection";
import ParentBillingSection from "./ParentBillingSection";
import ParentJournalSection from "./ParentJournalSection";
import ParentAttendanceSection from "./ParentAttendanceSection";
export const dynamic = "force-dynamic";

export default function ParentDashboardContent() {
  const t = useTranslations("Dashboard");
  const isMobile = useMediaQuery("(max-width: 768px)");

  const { data: session, status } = useSession();
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("overview");

  useEffect(() => {
    const storedSection = localStorage.getItem("activeSection");
    if (storedSection) {
      setActiveSection(storedSection as DashboardSection);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("activeSection", activeSection);
  }, [activeSection]);

  if (status === "loading") return <CenteredSpinner label={t("loading")} />;
  if (!session || session.user.role !== "PARENT") {
    redirect("/login");
    return null;
  }

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
        {activeSection === "overview" && (
          <ParentOverview setActiveSectionAction={setActiveSection} />
        )}

        {activeSection === "children" && <ParentChildrenSection />}

        {activeSection === "notification" && <ParentNotificationsSection />}

        {activeSection === "rib" && <RIBForm />}
        {activeSection === "documents" && <ParentDocumentsSection />}

        {activeSection === "billing" && (
          <ParentBillingSection setActiveSectionAction={setActiveSection} />
        )}

        {activeSection === "journal" && <ParentJournalSection />}

        {activeSection === "attendance" && <ParentAttendanceSection />}

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
