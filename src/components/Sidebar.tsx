"use client";
import { Dispatch, SetStateAction } from "react";
import { useSession } from "next-auth/react";
import AdminSidebar from "./AdminSidebar";
import DirectorSidebar from "./DirectorSidebar";
import ParentSidebar from "./ParentSidebar";
import StaffSidebar from "./StaffSidebar";
import TeacherSidebar from "./TeacherSidebar";
import { DashboardSection } from "../types/types";

export default function Sidebar({
  activeSection,
  setActiveSectionAction,
}: {
  activeSection: DashboardSection;
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const { data: session } = useSession();
  const role = session?.user?.role;

  return (
    <aside className="w-70 h-auto bg-[white] border-r p-4 space-y-4">
      {role === "DIRECTOR" && (
        <DirectorSidebar
          activeSection={activeSection}
          setActiveSectionAction={setActiveSectionAction}
        />
      )}
      {role === "PARENT" && (
        <ParentSidebar
          activeSection={activeSection}
          setActiveSectionAction={setActiveSectionAction}
        />
      )}
      {role === "TEACHER" && (
        <TeacherSidebar
          activeSection={activeSection}
          setActiveSectionAction={setActiveSectionAction}
        />
      )}
      {role === "SUPER_ADMIN" && (
        <AdminSidebar activeSection={activeSection} setActiveSectionAction={setActiveSectionAction} />
      )}
      {role === "STAFF" && (
        <StaffSidebar activeSection={activeSection} setActiveSectionAction={setActiveSectionAction} />
      )}
    </aside>
  );
}
