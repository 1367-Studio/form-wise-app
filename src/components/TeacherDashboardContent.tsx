"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useMediaQuery } from "../app/hooks/useMediaQuery";
import CenteredSpinner from "./CenteredSpinner";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";
import { DashboardSection } from "../types/types";

// Existing teacher components
import StudentListTeacher from "./StudentListTeacher";
import TeacherNotificationList from "./TeacherNotificationList";
import TeacherProfile from "./TeacherProfile";
import type { TeacherData } from "../types/teacher";
import AccountSettings from "./AccountSettings";
import TeacherJournalSection from "./TeacherJournalSection";
import TeacherAttendanceSection from "./TeacherAttendanceSection";

// New teacher components
import TeacherOverview from "./TeacherOverview";
import TeacherClassOverview from "./teacher/TeacherClassOverview";
import TeacherGroups from "./teacher/TeacherGroups";
import TeacherEvaluations from "./teacher/TeacherEvaluations";
import TeacherCompetences from "./teacher/TeacherCompetences";
import TeacherReportCards from "./teacher/TeacherReportCards";
import TeacherResources from "./teacher/TeacherResources";
import TeacherBehavior from "./teacher/TeacherBehavior";
import TeacherIncidents from "./teacher/TeacherIncidents";
import TeacherMessages from "./teacher/TeacherMessages";
import TeacherSchedule from "./teacher/TeacherSchedule";
import TeacherEvents from "./teacher/TeacherEvents";

function migrateSection(stored: string | null): DashboardSection {
  if (!stored) return "teacherHome";
  if (stored === "myProfile") return "teacherHome";
  return stored as DashboardSection;
}

export default function TeacherDashboardContent() {
  const t = useTranslations("Dashboard");
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("teacherHome");
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("teacherActiveSection");
    setActiveSection(migrateSection(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("teacherActiveSection", activeSection);
  }, [activeSection]);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const res = await fetch("/api/teachers/me");
        const data = await res.json();
        setTeacher(data.teacher);
      } catch (err) {
        console.error("Teacher fetch error:", err);
      } finally {
        setLoadingTeacher(false);
      }
    };
    fetchTeacher();
  }, []);

  if (status === "loading") return <CenteredSpinner label={t("loading")} />;
  if (!session || session.user.role !== "TEACHER") redirect("/login");

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
        {/* ── Teacher Home ── */}
        {activeSection === "teacherHome" && (
          <TeacherOverview setActiveSectionAction={setActiveSection} />
        )}

        {/* ── Ma classe ── */}
        {activeSection === "teacherClassOverview" && <TeacherClassOverview />}
        {activeSection === "eleves" && <StudentListTeacher />}
        {activeSection === "teacherGroups" && <TeacherGroups />}

        {/* ── Pédagogie ── */}
        {activeSection === "journal" && <TeacherJournalSection />}
        {activeSection === "teacherEvaluations" && <TeacherEvaluations />}
        {activeSection === "teacherCompetences" && <TeacherCompetences />}
        {activeSection === "teacherReportCards" && <TeacherReportCards />}
        {activeSection === "teacherResources" && <TeacherResources />}

        {/* ── Suivi quotidien ── */}
        {activeSection === "attendance" && <TeacherAttendanceSection />}
        {activeSection === "teacherBehavior" && <TeacherBehavior />}
        {activeSection === "teacherIncidents" && <TeacherIncidents />}

        {/* ── Communication ── */}
        {activeSection === "notifications" && <TeacherNotificationList />}
        {activeSection === "teacherMessages" && <TeacherMessages />}

        {/* ── Planning ── */}
        {activeSection === "teacherSchedule" && <TeacherSchedule />}
        {activeSection === "teacherEvents" && <TeacherEvents />}

        {/* ── Mon compte ── */}
        {activeSection === "myProfile" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("myProfileTitle")}
            </h2>
            {loadingTeacher ? (
              <CenteredSpinner label={t("loadingTeacherInfo")} />
            ) : teacher ? (
              <TeacherProfile teacher={teacher} />
            ) : (
              <p className="text-muted-foreground">{t("noTeacherData")}</p>
            )}
          </div>
        )}
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
