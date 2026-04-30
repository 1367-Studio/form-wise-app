import { DashboardSection } from "@/types/types";

export type ParentSidebarItem = {
  key: DashboardSection;
  labelKey: string;
  iconName: string;
};

export type ParentSidebarGroup = {
  id: string;
  labelKey: string;
  iconName: string;
  items: ParentSidebarItem[];
};

export const PARENT_HOME_ITEM: ParentSidebarItem = {
  key: "overview",
  labelKey: "overview",
  iconName: "Home",
};

export const PARENT_SIDEBAR_GROUPS: ParentSidebarGroup[] = [
  {
    id: "children",
    labelKey: "groupChildren",
    iconName: "Users",
    items: [
      { key: "children", labelKey: "myChildren", iconName: "Users" },
      { key: "parentProgress", labelKey: "progress", iconName: "TrendingUp" },
      { key: "documents", labelKey: "documents", iconName: "FileText" },
    ],
  },
  {
    id: "schoolLife",
    labelKey: "groupSchoolLife",
    iconName: "GraduationCap",
    items: [
      { key: "journal", labelKey: "dailyJournal", iconName: "NotebookPen" },
      { key: "attendance", labelKey: "attendance", iconName: "ClipboardCheck" },
      { key: "parentGrades", labelKey: "grades", iconName: "Award" },
      { key: "parentCalendar", labelKey: "calendar", iconName: "CalendarDays" },
    ],
  },
  {
    id: "communication",
    labelKey: "groupCommunication",
    iconName: "MessageSquare",
    items: [
      { key: "notification", labelKey: "notifications", iconName: "Bell" },
      { key: "parentMessages", labelKey: "parentMessages", iconName: "Mail" },
    ],
  },
  {
    id: "logistics",
    labelKey: "groupLogistics",
    iconName: "Truck",
    items: [
      { key: "pickup", labelKey: "pickup", iconName: "LogIn" },
      { key: "parentCanteen", labelKey: "canteen", iconName: "UtensilsCrossed" },
      { key: "parentTransport", labelKey: "transport", iconName: "Bus" },
    ],
  },
  {
    id: "finance",
    labelKey: "groupFinance",
    iconName: "Wallet",
    items: [
      { key: "billing", labelKey: "billing", iconName: "Receipt" },
      { key: "rib", labelKey: "bankDetails", iconName: "CreditCard" },
    ],
  },
  {
    id: "account",
    labelKey: "groupAccount",
    iconName: "User",
    items: [
      { key: "settings", labelKey: "settings", iconName: "Settings" },
    ],
  },
];
