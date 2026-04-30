import { DashboardSection } from "@/types/types";

export type TeacherSidebarItem = {
  key: DashboardSection;
  labelKey: string;
  iconName: string;
};

export type TeacherSidebarGroup = {
  id: string;
  labelKey: string;
  iconName: string;
  items: TeacherSidebarItem[];
};

export const TEACHER_HOME_ITEM: TeacherSidebarItem = {
  key: "teacherHome",
  labelKey: "teacherHome",
  iconName: "Home",
};

export const TEACHER_SIDEBAR_GROUPS: TeacherSidebarGroup[] = [
  {
    id: "myClass",
    labelKey: "groupMyClass",
    iconName: "LayoutGrid",
    items: [
      { key: "teacherClassOverview", labelKey: "classOverview", iconName: "LayoutDashboard" },
      { key: "eleves", labelKey: "students", iconName: "Users" },
      { key: "teacherGroups", labelKey: "groups", iconName: "UsersRound" },
    ],
  },
  {
    id: "pedagogy",
    labelKey: "groupPedagogy",
    iconName: "GraduationCap",
    items: [
      { key: "journal", labelKey: "classJournal", iconName: "NotebookPen" },
      { key: "teacherEvaluations", labelKey: "evaluations", iconName: "ClipboardList" },
      { key: "teacherCompetences", labelKey: "competencies", iconName: "Target" },
      { key: "teacherReportCards", labelKey: "reportCards", iconName: "ScrollText" },
      { key: "teacherResources", labelKey: "resources", iconName: "FolderOpen" },
    ],
  },
  {
    id: "dailyTracking",
    labelKey: "groupDailyTracking",
    iconName: "ClipboardCheck",
    items: [
      { key: "attendance", labelKey: "rollCall", iconName: "ClipboardCheck" },
      { key: "teacherBehavior", labelKey: "behavior", iconName: "Heart" },
      { key: "teacherIncidents", labelKey: "incidents", iconName: "AlertTriangle" },
    ],
  },
  {
    id: "communication",
    labelKey: "groupCommunication",
    iconName: "MessageSquare",
    items: [
      { key: "notifications", labelKey: "notifications", iconName: "Bell" },
      { key: "teacherMessages", labelKey: "parentMessages", iconName: "Mail" },
    ],
  },
  {
    id: "planning",
    labelKey: "groupPlanning",
    iconName: "Calendar",
    items: [
      { key: "teacherSchedule", labelKey: "timetable", iconName: "CalendarRange" },
      { key: "teacherEvents", labelKey: "events", iconName: "CalendarDays" },
    ],
  },
  {
    id: "account",
    labelKey: "groupAccount",
    iconName: "User",
    items: [
      { key: "myProfile", labelKey: "myProfile", iconName: "User" },
      { key: "settings", labelKey: "settings", iconName: "Settings" },
    ],
  },
];
