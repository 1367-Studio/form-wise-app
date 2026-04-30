import { DashboardSection } from "@/types/types";

export type DirectorSidebarItem = {
  key: DashboardSection;
  labelKey: string;
  iconName: string;
};

export type DirectorSidebarGroup = {
  id: string;
  labelKey: string;
  iconName: string;
  items: DirectorSidebarItem[];
};

/** Standalone home item (rendered above the groups). */
export const DIRECTOR_HOME_ITEM: DirectorSidebarItem = {
  key: "directorHome",
  labelKey: "directorHome",
  iconName: "Home",
};

/** Ordered groups for the director sidebar. */
export const DIRECTOR_SIDEBAR_GROUPS: DirectorSidebarGroup[] = [
  {
    id: "pilotage",
    labelKey: "groupPilotage",
    iconName: "BarChart3",
    items: [
      { key: "directorKpi", labelKey: "kpiDashboard", iconName: "LayoutDashboard" },
      { key: "directorReports", labelKey: "reports", iconName: "FileBarChart" },
      { key: "charts", labelKey: "statistics", iconName: "ChartPie" },
    ],
  },
  {
    id: "studentsFamilies",
    labelKey: "groupStudentsFamilies",
    iconName: "Users",
    items: [
      { key: "eleves", labelKey: "students", iconName: "Users" },
      { key: "directorFamilies", labelKey: "families", iconName: "UserRound" },
      { key: "directorInscriptions", labelKey: "inscriptions", iconName: "UserPlus" },
      { key: "directorAttendance", labelKey: "studentAttendance", iconName: "ClipboardCheck" },
      { key: "documents", labelKey: "studentDocuments", iconName: "FileText" },
    ],
  },
  {
    id: "pedagogy",
    labelKey: "groupPedagogy",
    iconName: "GraduationCap",
    items: [
      { key: "directorJournal", labelKey: "classJournal", iconName: "NotebookPen" },
      { key: "directorEvaluations", labelKey: "evaluations", iconName: "ClipboardList" },
      { key: "directorCompetences", labelKey: "competencies", iconName: "Target" },
      { key: "directorBulletins", labelKey: "reportCards", iconName: "ScrollText" },
      { key: "classes", labelKey: "classesSubjects", iconName: "LayoutGrid" },
    ],
  },
  {
    id: "planningOps",
    labelKey: "groupPlanningOps",
    iconName: "Calendar",
    items: [
      { key: "directorPlanning", labelKey: "planning", iconName: "CalendarRange" },
      { key: "directorTeacherAttendance", labelKey: "teacherAttendance", iconName: "ClipboardCheck" },
      { key: "pickup", labelKey: "pickup", iconName: "LogIn" },
      { key: "directorRooms", labelKey: "roomsResources", iconName: "DoorOpen" },
      { key: "directorEvents", labelKey: "events", iconName: "CalendarDays" },
    ],
  },
  {
    id: "finance",
    labelKey: "groupFinance",
    iconName: "Wallet",
    items: [
      { key: "directorFinanceOverview", labelKey: "financeOverview", iconName: "TrendingUp" },
      { key: "directorInvoices", labelKey: "invoices", iconName: "Receipt" },
      { key: "directorPayments", labelKey: "payments", iconName: "CreditCard" },
      { key: "directorLatePayments", labelKey: "latePayments", iconName: "AlertCircle" },
      { key: "directorReminders", labelKey: "reminders", iconName: "Bell" },
      { key: "directorPricing", labelKey: "pricingFees", iconName: "Tags" },
      { key: "directorBankDetails", labelKey: "bankDetailsSchool", iconName: "Landmark" },
    ],
  },
  {
    id: "hr",
    labelKey: "groupHR",
    iconName: "Briefcase",
    items: [
      { key: "inviteStaff", labelKey: "staff", iconName: "UserPlus" },
      { key: "teachers", labelKey: "teachers", iconName: "UserRound" },
      { key: "directorContracts", labelKey: "contracts", iconName: "FileSignature" },
      { key: "directorStaffAttendance", labelKey: "staffAttendance", iconName: "ClipboardCheck" },
      { key: "directorStaffHours", labelKey: "workedHours", iconName: "Clock" },
      { key: "directorPayroll", labelKey: "payroll", iconName: "Coins" },
    ],
  },
  {
    id: "communication",
    labelKey: "groupCommunication",
    iconName: "MessageSquare",
    items: [
      { key: "notification", labelKey: "notifications", iconName: "Bell" },
      { key: "directorMessages", labelKey: "messages", iconName: "Mail" },
      { key: "directorCampaigns", labelKey: "campaigns", iconName: "Megaphone" },
      { key: "directorTemplates", labelKey: "templates", iconName: "FileCode" },
    ],
  },
  {
    id: "admin",
    labelKey: "groupAdmin",
    iconName: "Shield",
    items: [
      { key: "directorUsers", labelKey: "users", iconName: "Users" },
      { key: "directorRoles", labelKey: "rolesPermissions", iconName: "ShieldCheck" },
      { key: "directorSchoolSettings", labelKey: "schoolSettings", iconName: "School" },
      { key: "settings", labelKey: "settings", iconName: "Settings" },
    ],
  },
];
