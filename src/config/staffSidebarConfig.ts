import { DashboardSection } from "@/types/types";

export type StaffSidebarItem = {
  key: DashboardSection;
  labelKey: string;
  iconName: string;
};

export type StaffSidebarGroup = {
  id: string;
  labelKey: string;
  iconName: string;
  items: StaffSidebarItem[];
};

export const STAFF_HOME_ITEM: StaffSidebarItem = {
  key: "staffHome",
  labelKey: "staffHome",
  iconName: "Home",
};

export const STAFF_SIDEBAR_GROUPS: StaffSidebarGroup[] = [
  {
    id: "students",
    labelKey: "groupStudents",
    iconName: "Users",
    items: [
      { key: "eleves", labelKey: "students", iconName: "Users" },
      { key: "staffAttendance", labelKey: "studentAttendance", iconName: "ClipboardCheck" },
      { key: "staffDocuments", labelKey: "documents", iconName: "FileText" },
    ],
  },
  {
    id: "operations",
    labelKey: "groupOperations",
    iconName: "Truck",
    items: [
      { key: "staffPickup", labelKey: "pickup", iconName: "LogIn" },
    ],
  },
  {
    id: "communication",
    labelKey: "groupCommunication",
    iconName: "MessageSquare",
    items: [
      { key: "notification", labelKey: "notifications", iconName: "Bell" },
      { key: "staffMessages", labelKey: "messages", iconName: "Mail" },
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
