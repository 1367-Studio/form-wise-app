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
import ParentPickupSection from "./ParentPickupSection";
import ParentProgress from "./parent/ParentProgress";
import ParentGrades from "./parent/ParentGrades";
import ParentCalendar from "./parent/ParentCalendar";
import ParentMessagesSection from "./parent/ParentMessagesSection";
import ParentCanteen from "./parent/ParentCanteen";
import ParentTransport from "./parent/ParentTransport";
import { SelectedChildProvider } from "@/contexts/SelectedChildContext";
import { ChildSwitcher } from "./ChildSwitcher";
export const dynamic = "force-dynamic";

const SECTIONS_WITH_SWITCHER: ReadonlySet<DashboardSection> = new Set([
  "overview",
  "children",
  "journal",
  "attendance",
  "pickup",
  "documents",
  "notification",
  "billing",
]);

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
    <SelectedChildProvider>
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
        <main className="flex-1 p-6 mt-10 md:mt-0 space-y-4">
          {SECTIONS_WITH_SWITCHER.has(activeSection) && <ChildSwitcher />}
          <SectionRenderer
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            t={t}
          />
        </main>
      </div>
    </SelectedChildProvider>
  );
}

function SectionRenderer({
  activeSection,
  setActiveSection,
  t,
}: {
  activeSection: DashboardSection;
  setActiveSection: React.Dispatch<React.SetStateAction<DashboardSection>>;
  t: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
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

      {activeSection === "pickup" && <ParentPickupSection />}

      {activeSection === "parentProgress" && <ParentProgress />}

      {activeSection === "parentGrades" && <ParentGrades />}

      {activeSection === "parentCalendar" && <ParentCalendar />}

      {activeSection === "parentMessages" && <ParentMessagesSection />}

      {activeSection === "parentCanteen" && <ParentCanteen />}

      {activeSection === "parentTransport" && <ParentTransport />}

      {activeSection === "settings" && (
        <div>
          <h2 className="text-xl font-semibold mb-4">
            {t("accountSettings")}
          </h2>
          <AccountSettings />
        </div>
      )}
    </>
  );
}
