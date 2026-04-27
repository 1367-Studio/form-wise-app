"use client";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import SidebarBtn from "./SidebarBtn";
import { DashboardSection } from "../types/types";
import {
  CalendarDays,
  LayoutGrid,
  BookOpen,
  UserRound,
  Bell,
  Users,
  CreditCard,
  ChartPie,
  User,
  FileText,
  UserLock,
  Settings,
  UserPlus,
  ShieldAlert,
  Receipt,
  AlertCircle,
  Megaphone,
  UserCheck,
  History,
  Home,
  Wallet,
  NotebookPen,
  ClipboardCheck,
} from "lucide-react";
import { ParentNotification } from "../types/notification";

export default function Sidebar({
  activeSection,
  setActiveSectionAction,
}: {
  activeSection: DashboardSection;
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("Sidebar");
  const { data: session } = useSession();
  const role = session?.user?.role;
  const [hasUnreadNotifs, setHasUnreadNotifs] = useState<boolean | null>(null);
  const [hasUnreadJournal, setHasUnreadJournal] = useState<boolean | null>(
    null
  );

  useEffect(() => {
    const checkUnread = async () => {
      try {
        if (!session?.user?.id || role !== "PARENT") return;

        const res = await fetch("/api/notifications");
        if (!res.ok) return;

        const data: { notifications: ParentNotification[] } = await res.json();

        const hasUnread = data.notifications.some((notif) => {
          const readBy = notif.readBy || [];
          return !readBy.some((entry) => entry.parentId === session.user.id);
        });

        setHasUnreadNotifs(hasUnread);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    const checkJournal = async () => {
      try {
        if (!session?.user?.id || role !== "PARENT") return;
        const res = await fetch("/api/parent/journal");
        if (!res.ok) return;
        const data: { entries: { isRead: boolean }[] } = await res.json();
        setHasUnreadJournal(data.entries.some((e) => !e.isRead));
      } catch {
        // ignore
      }
    };

    checkUnread();
    checkJournal();
  }, [role, session?.user?.id]);

  return (
    <aside className="w-70 h-auto bg-[white] border-r p-4 space-y-4">
      {role === "DIRECTOR" && (
        <>
          <SidebarBtn
            label={t("schoolYear")}
            section="schoolYear"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<CalendarDays className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("classes")}
            section="classes"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<LayoutGrid className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("subjects")}
            section="subjects"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<BookOpen className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("teachers")}
            section="teachers"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<UserRound className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("notifications")}
            section="notification"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Bell className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("students")}
            section="eleves"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Users className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("pendingStudents")}
            section="pendingStudents"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<UserLock className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("pendingPreinscriptions")}
            section="pendingPreinscriptions"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<ShieldAlert className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("documents")}
            section="documents"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<FileText className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("charts")}
            section="charts"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<ChartPie className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("settings")}
            section="settings"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Settings className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("inviteParents")}
            section="inviteParent"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<User className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("inviteStaff")}
            section="inviteStaff"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<UserPlus className="w-4 h-4" />}
          />
        </>
      )}
      {role === "PARENT" && (
        <>
          <SidebarBtn
            label={t("overview")}
            section="overview"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Home className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("myChildren")}
            section="children"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Users className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("dailyJournal")}
            section="journal"
            activeSection={activeSection}
            setActiveSection={(section) => {
              setActiveSectionAction(section);
              setHasUnreadJournal(false);
            }}
            hasNotification={hasUnreadJournal ?? undefined}
            icon={<NotebookPen className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("attendance")}
            section="attendance"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("documents")}
            section="documents"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<FileText className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("notifications")}
            section="notification"
            activeSection={activeSection}
            setActiveSection={(section) => {
              setActiveSectionAction(section);
              setHasUnreadNotifs(false);
            }}
            hasNotification={hasUnreadNotifs ?? undefined}
            icon={<Bell className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("billing")}
            section="billing"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Wallet className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("bankDetails")}
            section="rib"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<CreditCard className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("settings")}
            section="settings"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Settings className="w-4 h-4" />}
          />
        </>
      )}
      {role === "TEACHER" && (
        <>
          <SidebarBtn
            label={t("myProfile")}
            section="myProfile"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<User className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("dailyJournal")}
            section="journal"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<NotebookPen className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("attendance")}
            section="attendance"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<ClipboardCheck className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("notifications")}
            section="notifications"
            activeSection={activeSection}
            setActiveSection={(section) => {
              setActiveSectionAction(section);
              setHasUnreadNotifs(false);
            }}
            hasNotification={hasUnreadNotifs}
            icon={<Bell className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("students")}
            section="eleves"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Users className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("settings")}
            section="settings"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Settings className="w-4 h-4" />}
          />
        </>
      )}
      {role === "SUPER_ADMIN" && (
        <>
          <SidebarBtn
            label={t("schools")}
            section="tenants"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<LayoutGrid className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("statistics")}
            section="chartsAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<ChartPie className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("billing")}
            section="billingAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Receipt className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("failedPayments")}
            section="failedPaymentsAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<AlertCircle className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("broadcast")}
            section="broadcastAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Megaphone className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("impersonate")}
            section="impersonateAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<UserCheck className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("auditLog")}
            section="auditAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<History className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("settings")}
            section="settingsAdmin"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Settings className="w-4 h-4" />}
          />
        </>
      )}
      {role === "STAFF" && (
        <>
          <SidebarBtn
            label={t("students")}
            section="eleves"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Users className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("notifications")}
            section="notification"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Bell className="w-4 h-4" />}
          />
          <SidebarBtn
            label={t("settings")}
            section="settings"
            activeSection={activeSection}
            setActiveSection={setActiveSectionAction}
            icon={<Settings className="w-4 h-4" />}
          />
        </>
      )}
    </aside>
  );
}
