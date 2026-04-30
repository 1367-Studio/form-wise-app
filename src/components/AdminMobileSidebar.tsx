"use client";

import { Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { signOut } from "next-auth/react";
import { DashboardSection } from "@/types/types";
import {
  ADMIN_HOME_ITEM,
  ADMIN_SIDEBAR_GROUPS,
  AdminSidebarGroup,
} from "@/config/adminSidebarConfig";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import {
  Home,
  Building2,
  LayoutGrid,
  Activity,
  Filter,
  BarChart3,
  ChartPie,
  FileBarChart,
  Wallet,
  Receipt,
  AlertCircle,
  Wrench,
  Megaphone,
  UserCheck,
  HeartPulse,
  Shield,
  History,
  ShieldCheck,
  Settings,
  Cog,
  ChevronRight,
  ChevronDown,
  LogOut,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Icon map                                                           */
/* ------------------------------------------------------------------ */
const ICON_MAP: Record<string, LucideIcon> = {
  Home,
  Building2,
  LayoutGrid,
  Activity,
  Filter,
  BarChart3,
  ChartPie,
  FileBarChart,
  Wallet,
  Receipt,
  AlertCircle,
  Wrench,
  Megaphone,
  UserCheck,
  HeartPulse,
  Shield,
  History,
  ShieldCheck,
  Settings,
  Cog,
};

function resolveIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Home;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */
export default function AdminMobileSidebar({
  activeSection,
  setActiveSectionAction,
}: {
  activeSection: DashboardSection;
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("Sidebar");
  const [open, setOpen] = useState(false);

  /* --- Determine which group holds the active section --------------- */
  const activeGroupId = useMemo(() => {
    for (const group of ADMIN_SIDEBAR_GROUPS) {
      if (group.items.some((item) => item.key === activeSection)) {
        return group.id;
      }
    }
    return null;
  }, [activeSection]);

  /* --- Open-groups state ------------------------------------------- */
  const [openGroups, setOpenGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    if (activeGroupId) {
      initial.add(activeGroupId);
    }
    return initial;
  });

  // Auto-open group when activeSection changes
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

  const handleSelectSection = useCallback(
    (section: DashboardSection) => {
      setActiveSectionAction(section);
      setOpen(false);
    },
    [setActiveSectionAction],
  );

  /* --- Render ------------------------------------------------------ */
  const HomeIcon = resolveIcon(ADMIN_HOME_ITEM.iconName);
  const isHomeActive = activeSection === ADMIN_HOME_ITEM.key;

  return (
    <div className="fixed top-4 right-4 z-50 md:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            {t("menuButton")}
          </Button>
        </SheetTrigger>
        <SheetContent className="h-screen p-4 pt-6 pr-2" side="left">
          <div className="flex h-full flex-col">
            <SheetTitle className="mb-4 px-2 text-lg font-semibold">
              {t("menu")}
            </SheetTitle>

            {/* Scrollable navigation */}
            <div className="flex-1 overflow-y-auto pr-1">
              <nav className="space-y-1">
                {/* Home button */}
                <button
                  type="button"
                  onClick={() => handleSelectSection(ADMIN_HOME_ITEM.key)}
                  className={`flex w-full cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                    isHomeActive
                      ? "border-l-2 border-l-[#2563EB] bg-blue-50 font-medium text-[#2563EB]"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <HomeIcon className="h-4 w-4" />
                  <span>{t(ADMIN_HOME_ITEM.labelKey)}</span>
                </button>

                {/* Groups */}
                {ADMIN_SIDEBAR_GROUPS.map((group) => (
                  <MobileGroup
                    key={group.id}
                    group={group}
                    isOpen={openGroups.has(group.id)}
                    onToggle={toggleGroup}
                    activeSection={activeSection}
                    onSelect={handleSelectSection}
                    t={t}
                  />
                ))}
              </nav>
            </div>

            {/* Sign out */}
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-4 flex w-full cursor-pointer items-center justify-start gap-2 px-4 py-2"
            >
              <LogOut className="h-4 w-4" />
              <span>{t("signOut")}</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MobileGroup – collapsible group within the sheet                   */
/* ------------------------------------------------------------------ */
function MobileGroup({
  group,
  isOpen,
  onToggle,
  activeSection,
  onSelect,
  t,
}: {
  group: AdminSidebarGroup;
  isOpen: boolean;
  onToggle: (id: string) => void;
  activeSection: DashboardSection;
  onSelect: (section: DashboardSection) => void;
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
                onClick={() => onSelect(item.key)}
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
