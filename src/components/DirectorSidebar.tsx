"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { DashboardSection } from "@/types/types";
import {
  DIRECTOR_HOME_ITEM,
  DIRECTOR_SIDEBAR_GROUPS,
  DirectorSidebarGroup,
} from "@/config/directorSidebarConfig";
import {
  Home,
  BarChart3,
  LayoutDashboard,
  FileBarChart,
  ChartPie,
  Users,
  UserRound,
  UserPlus,
  ClipboardCheck,
  FileText,
  GraduationCap,
  NotebookPen,
  ClipboardList,
  Target,
  ScrollText,
  LayoutGrid,
  Calendar,
  CalendarRange,
  LogIn,
  DoorOpen,
  CalendarDays,
  Wallet,
  TrendingUp,
  Receipt,
  CreditCard,
  AlertCircle,
  Bell,
  Tags,
  Landmark,
  Briefcase,
  FileSignature,
  Clock,
  Coins,
  MessageSquare,
  Mail,
  Megaphone,
  FileCode,
  Shield,
  ShieldCheck,
  School,
  Settings,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Icon map – resolves the string `iconName` from the config          */
/* ------------------------------------------------------------------ */
const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  BarChart3,
  LayoutDashboard,
  FileBarChart,
  ChartPie,
  Users,
  UserRound,
  UserPlus,
  ClipboardCheck,
  FileText,
  GraduationCap,
  NotebookPen,
  ClipboardList,
  Target,
  ScrollText,
  LayoutGrid,
  Calendar,
  CalendarRange,
  LogIn,
  DoorOpen,
  CalendarDays,
  Wallet,
  TrendingUp,
  Receipt,
  CreditCard,
  AlertCircle,
  Bell,
  Tags,
  Landmark,
  Briefcase,
  FileSignature,
  Clock,
  Coins,
  MessageSquare,
  Mail,
  Megaphone,
  FileCode,
  Shield,
  ShieldCheck,
  School,
  Settings,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Home;
}

/* ------------------------------------------------------------------ */
/*  localStorage helpers                                               */
/* ------------------------------------------------------------------ */
const STORAGE_KEY = "directorSidebarGroups";

function loadOpenGroups(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: string[] = JSON.parse(raw);
      return new Set(parsed);
    }
  } catch {
    // ignore
  }
  return new Set<string>();
}

function saveOpenGroups(groups: Set<string>) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...groups]));
  } catch {
    // ignore
  }
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function DirectorSidebar({
  activeSection,
  setActiveSectionAction,
}: {
  activeSection: DashboardSection;
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("Sidebar");

  /* --- Determine which group holds the active section --------------- */
  const activeGroupId = useMemo(() => {
    for (const group of DIRECTOR_SIDEBAR_GROUPS) {
      if (group.items.some((item) => item.key === activeSection)) {
        return group.id;
      }
    }
    return null;
  }, [activeSection]);

  /* --- Open-groups state ------------------------------------------- */
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const stored = loadOpenGroups();
    // Auto-open the group that contains the current active section
    if (activeGroupId) {
      stored.add(activeGroupId);
    }
    return stored;
  });

  // Persist to localStorage whenever openGroups changes
  useEffect(() => {
    saveOpenGroups(openGroups);
  }, [openGroups]);

  // Auto-open group when activeSection changes externally
  useEffect(() => {
    if (activeGroupId && !openGroups.has(activeGroupId)) {
      setOpenGroups((prev) => {
        const next = new Set(prev);
        next.add(activeGroupId);
        return next;
      });
    }
  }, [activeGroupId]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleGroup = useCallback((groupId: string) => {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) {
        next.delete(groupId);
      } else {
        next.add(groupId);
      }
      return next;
    });
  }, []);

  /* --- Render helpers ---------------------------------------------- */
  const HomeIcon = resolveIcon(DIRECTOR_HOME_ITEM.iconName);
  const isHomeActive = activeSection === DIRECTOR_HOME_ITEM.key;

  return (
    <nav className="space-y-1">
      {/* Home button */}
      <button
        type="button"
        onClick={() => setActiveSectionAction(DIRECTOR_HOME_ITEM.key)}
        className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
          isHomeActive
            ? "border-l-2 border-l-[#2563EB] bg-blue-50 font-medium text-[#2563EB]"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        }`}
      >
        <HomeIcon className="h-4 w-4" />
        <span>{t(DIRECTOR_HOME_ITEM.labelKey)}</span>
      </button>

      {/* Scrollable group list */}
      <div className="flex-1 overflow-y-auto">
        {DIRECTOR_SIDEBAR_GROUPS.map((group) => (
          <SidebarGroup
            key={group.id}
            group={group}
            isOpen={openGroups.has(group.id)}
            onToggle={toggleGroup}
            activeSection={activeSection}
            setActiveSectionAction={setActiveSectionAction}
            t={t}
          />
        ))}
      </div>
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/*  SidebarGroup – individual collapsible group                        */
/* ------------------------------------------------------------------ */
function SidebarGroup({
  group,
  isOpen,
  onToggle,
  activeSection,
  setActiveSectionAction,
  t,
}: {
  group: DirectorSidebarGroup;
  isOpen: boolean;
  onToggle: (id: string) => void;
  activeSection: DashboardSection;
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
  t: ReturnType<typeof useTranslations<"Sidebar">>;
}) {
  return (
    <div className="mt-2">
      {/* Group header */}
      <button
        type="button"
        onClick={() => onToggle(group.id)}
        className="flex w-full cursor-pointer items-center gap-1 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-slate-400 transition-colors hover:text-slate-600"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" />
        ) : (
          <ChevronRight className="h-3 w-3" />
        )}
        <span>{t(group.labelKey)}</span>
      </button>

      {/* Group items */}
      {isOpen && (
        <div className="pl-3">
          {group.items.map((item) => {
            const Icon = resolveIcon(item.iconName);
            const isActive = activeSection === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveSectionAction(item.key)}
                className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isActive
                    ? "border-l-2 border-l-[#2563EB] bg-blue-50 font-medium text-[#2563EB]"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{t(item.labelKey)}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
