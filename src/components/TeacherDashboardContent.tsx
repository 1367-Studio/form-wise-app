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
import StudentListTeacher from "./StudentListTeacher";
import TeacherNotificationList from "./TeacherNotificationList";
import TeacherProfile from "./TeacherProfile";
import type { TeacherData } from "../types/teacher";
import AccountSettings from "./AccountSettings";
import TeacherJournalSection from "./TeacherJournalSection";
import TeacherAttendanceSection from "./TeacherAttendanceSection";

export default function TeacherDashboardContent() {
  const t = useTranslations("Dashboard");
  const { data: session, status } = useSession();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activeSection, setActiveSection] =
    useState<DashboardSection>("myProfile");
  const [teacher, setTeacher] = useState<TeacherData | null>(null);
  const [loadingTeacher, setLoadingTeacher] = useState(true);

  useEffect(() => {
    const savedSection = localStorage.getItem("teacherActiveSection");
    if (savedSection) {
      setActiveSection(savedSection as DashboardSection);
    }
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
        <p className="mb-6">
          {t("welcomeProfessor", { name: teacher?.user?.firstName ?? "" })}
        </p>

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

        {activeSection === "eleves" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("classStudentsTitle")}
            </h2>
            <StudentListTeacher />
          </div>
        )}

        {activeSection === "notifications" && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {t("receivedNotifications")}
            </h2>
            <TeacherNotificationList />
          </div>
        )}
        {activeSection === "journal" && <TeacherJournalSection />}

        {activeSection === "attendance" && <TeacherAttendanceSection />}

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
