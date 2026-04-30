"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { DashboardSection } from "../types/types";
import { useMediaQuery } from "../app/hooks/useMediaQuery";

// Layout
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import CenteredSpinner from "./CenteredSpinner";

// Existing director components
import SchoolYearForm from "./SchoolYearForm";
import SchoolYearList from "./SchoolYearList";
import ClassForm from "./ClassForm";
import ClassList from "./ClassList";
import ClassesSubjectsManager from "./ClassesSubjectsManager";
import TeacherList from "./TeacherList";
import NotificationForm from "./NotificationForm";
import DirectorNotificationList from "./DirectorNotificationList";
import StudentListWithFilter from "./StudentListWithFilter";
import DashboardCharts from "./DashboardCharts";
import PendingStudents from "./PendingStudents";
import DirectorDocumentList from "./DirectorDocumentList";
import AccountSettings from "./AccountSettings";
import InviteParentsPage from "../app/[locale]/dashboard/director/invite-parents/page";
import { InvitedParentList } from "./InvitedParentList";
import StaffForm from "./StaffForm";
import InvitedStaffList from "./InvitedStaffList";
import PendingPreinscriptionsTable from "./PendingPreinscriptionsTable";
import DirectorPickupSection from "./DirectorPickupSection";

// New director components
import DirectorOverview from "./DirectorOverview";
import DirectorKpiDashboard from "./director/DirectorKpiDashboard";
import DirectorReports from "./director/DirectorReports";
import DirectorFamilies from "./director/DirectorFamilies";
import DirectorInscriptions from "./director/DirectorInscriptions";
import DirectorStudentAttendance from "./director/DirectorStudentAttendance";
import DirectorJournalView from "./director/DirectorJournalView";
import DirectorEvaluations from "./director/DirectorEvaluations";
import DirectorCompetences from "./director/DirectorCompetences";
import DirectorBulletins from "./director/DirectorBulletins";
import DirectorPlanning from "./director/DirectorPlanning";
import DirectorTeacherAttendance from "./director/DirectorTeacherAttendance";
import DirectorRooms from "./director/DirectorRooms";
import DirectorEvents from "./director/DirectorEvents";
import DirectorFinanceOverview from "./director/DirectorFinanceOverview";
import DirectorInvoices from "./director/DirectorInvoices";
import DirectorPayments from "./director/DirectorPayments";
import DirectorLatePayments from "./director/DirectorLatePayments";
import DirectorReminders from "./director/DirectorReminders";
import DirectorPricing from "./director/DirectorPricing";
import DirectorBankDetails from "./director/DirectorBankDetails";
import DirectorContracts from "./director/DirectorContracts";
import DirectorStaffAttendance from "./director/DirectorStaffAttendance";
import DirectorStaffHours from "./director/DirectorStaffHours";
import DirectorPayroll from "./director/DirectorPayroll";
import DirectorMessages from "./director/DirectorMessages";
import DirectorCampaigns from "./director/DirectorCampaigns";
import DirectorTemplates from "./director/DirectorTemplates";
import DirectorUsers from "./director/DirectorUsers";
import DirectorRoles from "./director/DirectorRoles";
import DirectorSchoolSettings from "./director/DirectorSchoolSettings";

export type InvitedStaff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleLabel: string;
  createdAt: string;
  accepted: boolean;
};

/** Migrate legacy localStorage section values to new defaults. */
function migrateSection(stored: string | null): DashboardSection {
  if (!stored) return "directorHome";
  // Legacy default was "schoolYear" — redirect to the new home
  if (stored === "schoolYear") return "directorHome";
  return stored as DashboardSection;
}

export default function DirectorDashboardContent() {
  const t = useTranslations("Dashboard");
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("directorHome");
  const [invitedStaffList, setInvitedStaffList] = useState<InvitedStaff[]>([]);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const res = await fetch("/api/invited-staff");
        const data = await res.json();
        setInvitedStaffList(data.staff || []);
      } catch (error) {
        console.error("Invited-staff fetch error:", error);
      }
    };

    if (activeSection === "inviteStaff") {
      fetchStaff();
    }
  }, [activeSection]);

  useEffect(() => {
    const saved = localStorage.getItem("directorActiveSection");
    setActiveSection(migrateSection(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("directorActiveSection", activeSection);
  }, [activeSection]);

  if (status === "loading") return <CenteredSpinner label={t("loading")} />;
  if (!session || session.user.role !== "DIRECTOR") redirect("/login");

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
        {/* ── Director Home ── */}
        {activeSection === "directorHome" && (
          <DirectorOverview setActiveSectionAction={setActiveSection} />
        )}

        {/* ── Pilotage ── */}
        {activeSection === "directorKpi" && <DirectorKpiDashboard />}
        {activeSection === "directorReports" && <DirectorReports />}
        {activeSection === "charts" && <DashboardCharts />}

        {/* ── Élèves & Familles ── */}
        {activeSection === "eleves" && <StudentListWithFilter />}
        {activeSection === "directorFamilies" && <DirectorFamilies />}
        {activeSection === "directorInscriptions" && <DirectorInscriptions />}
        {activeSection === "directorAttendance" && <DirectorStudentAttendance />}
        {activeSection === "documents" && <DirectorDocumentList />}

        {/* ── Pédagogie ── */}
        {activeSection === "directorJournal" && <DirectorJournalView />}
        {activeSection === "directorEvaluations" && <DirectorEvaluations />}
        {activeSection === "directorCompetences" && <DirectorCompetences />}
        {activeSection === "directorBulletins" && <DirectorBulletins />}
        {activeSection === "classes" && (
          <>
            <ClassForm onCreated={() => location.reload()} />
            <ClassList />
            <div className="mt-8">
              <ClassesSubjectsManager />
            </div>
          </>
        )}

        {/* ── Planning & Opérations ── */}
        {activeSection === "directorPlanning" && <DirectorPlanning />}
        {activeSection === "directorTeacherAttendance" && <DirectorTeacherAttendance />}
        {activeSection === "pickup" && <DirectorPickupSection />}
        {activeSection === "directorRooms" && <DirectorRooms />}
        {activeSection === "directorEvents" && <DirectorEvents />}

        {/* ── Finance ── */}
        {activeSection === "directorFinanceOverview" && <DirectorFinanceOverview />}
        {activeSection === "directorInvoices" && <DirectorInvoices />}
        {activeSection === "directorPayments" && <DirectorPayments />}
        {activeSection === "directorLatePayments" && <DirectorLatePayments />}
        {activeSection === "directorReminders" && <DirectorReminders />}
        {activeSection === "directorPricing" && <DirectorPricing />}
        {activeSection === "directorBankDetails" && <DirectorBankDetails />}

        {/* ── RH & Équipe ── */}
        {activeSection === "inviteStaff" && (
          <>
            <StaffForm />
            <InvitedStaffList
              staffList={invitedStaffList}
              setStaffListAction={setInvitedStaffList}
            />
          </>
        )}
        {activeSection === "teachers" && <TeacherList />}
        {activeSection === "directorContracts" && <DirectorContracts />}
        {activeSection === "directorStaffAttendance" && <DirectorStaffAttendance />}
        {activeSection === "directorStaffHours" && <DirectorStaffHours />}
        {activeSection === "directorPayroll" && <DirectorPayroll />}

        {/* ── Communication ── */}
        {activeSection === "notification" && (
          <>
            <NotificationForm onSent={() => location.reload()} />
            <DirectorNotificationList />
          </>
        )}
        {activeSection === "directorMessages" && <DirectorMessages />}
        {activeSection === "directorCampaigns" && <DirectorCampaigns />}
        {activeSection === "directorTemplates" && <DirectorTemplates />}

        {/* ── Administration ── */}
        {activeSection === "directorUsers" && <DirectorUsers />}
        {activeSection === "directorRoles" && <DirectorRoles />}
        {activeSection === "directorSchoolSettings" && <DirectorSchoolSettings />}
        {activeSection === "settings" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("accountSettings")}
            </h2>
            <AccountSettings />
          </div>
        )}

        {/* ── Legacy sections (backward compatibility) ── */}
        {activeSection === "schoolYear" && (
          <>
            <SchoolYearForm onCreated={() => location.reload()} />
            <SchoolYearList />
          </>
        )}
        {activeSection === "subjects" && <ClassesSubjectsManager />}
        {activeSection === "pendingStudents" && <PendingStudents />}
        {activeSection === "pendingPreinscriptions" && <PendingPreinscriptionsTable />}
        {activeSection === "inviteParent" && (
          <>
            <InviteParentsPage />
            <InvitedParentList />
          </>
        )}
      </main>
    </div>
  );
}
