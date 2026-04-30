import { DashboardSection } from "@/types/types";

export type AdminSidebarItem = {
  key: DashboardSection;
  labelKey: string;
  iconName: string;
};

export type AdminSidebarGroup = {
  id: string;
  labelKey: string;
  iconName: string;
  items: AdminSidebarItem[];
};

export const ADMIN_HOME_ITEM: AdminSidebarItem = {
  key: "adminHome",
  labelKey: "adminHome",
  iconName: "Home",
};

export const ADMIN_SIDEBAR_GROUPS: AdminSidebarGroup[] = [
  {
    id: "tenants",
    labelKey: "groupTenants",
    iconName: "Building2",
    items: [
      { key: "tenants", labelKey: "schools", iconName: "LayoutGrid" },
      { key: "adminActivity", labelKey: "activityFeed", iconName: "Activity" },
      { key: "adminFunnel", labelKey: "conversionFunnel", iconName: "Filter" },
    ],
  },
  {
    id: "analytics",
    labelKey: "groupAnalytics",
    iconName: "BarChart3",
    items: [
      { key: "chartsAdmin", labelKey: "statistics", iconName: "ChartPie" },
      { key: "adminReports", labelKey: "reports", iconName: "FileBarChart" },
    ],
  },
  {
    id: "billing",
    labelKey: "groupBilling",
    iconName: "Wallet",
    items: [
      { key: "billingAdmin", labelKey: "billing", iconName: "Receipt" },
      { key: "failedPaymentsAdmin", labelKey: "failedPayments", iconName: "AlertCircle" },
    ],
  },
  {
    id: "operations",
    labelKey: "groupOperations",
    iconName: "Wrench",
    items: [
      { key: "broadcastAdmin", labelKey: "broadcast", iconName: "Megaphone" },
      { key: "impersonateAdmin", labelKey: "impersonate", iconName: "UserCheck" },
      { key: "adminHealth", labelKey: "platformHealth", iconName: "HeartPulse" },
    ],
  },
  {
    id: "security",
    labelKey: "groupSecurity",
    iconName: "Shield",
    items: [
      { key: "auditAdmin", labelKey: "auditLog", iconName: "History" },
      { key: "adminSecurity", labelKey: "securityOverview", iconName: "ShieldCheck" },
    ],
  },
  {
    id: "settings",
    labelKey: "groupSettings",
    iconName: "Settings",
    items: [
      { key: "adminConfig", labelKey: "platformConfig", iconName: "Cog" },
      { key: "settingsAdmin", labelKey: "settings", iconName: "Settings" },
    ],
  },
];
