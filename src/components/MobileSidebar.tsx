"use client";

import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
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
  LogOut,
  UserPlus,
  ShieldAlert,
  Receipt,
} from "lucide-react";

type Section = {
  key: DashboardSection;
  label: string;
  icon: React.ReactNode;
};

const useSections = (role?: string): Section[] => {
  const t = useTranslations("Sidebar");

  if (role === "PARENT") {
    return [
      {
        key: "children",
        label: t("myChildren"),
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "notification",
        label: t("notifications"),
        icon: <Bell className="w-4 h-4" />,
      },
      {
        key: "rib",
        label: t("bankDetails"),
        icon: <CreditCard className="w-4 h-4" />,
      },
      {
        key: "documents",
        label: t("documents"),
        icon: <FileText className="w-4 h-4" />,
      },
      {
        key: "settings",
        label: t("settings"),
        icon: <Settings className="w-4 h-4" />,
      },
    ];
  }

  if (role === "DIRECTOR") {
    return [
      {
        key: "schoolYear",
        label: t("schoolYear"),
        icon: <CalendarDays className="w-4 h-4" />,
      },
      {
        key: "classes",
        label: t("classes"),
        icon: <LayoutGrid className="w-4 h-4" />,
      },
      {
        key: "subjects",
        label: t("subjects"),
        icon: <BookOpen className="w-4 h-4" />,
      },
      {
        key: "teachers",
        label: t("teachers"),
        icon: <UserRound className="w-4 h-4" />,
      },
      {
        key: "notification",
        label: t("notifications"),
        icon: <Bell className="w-4 h-4" />,
      },
      {
        key: "eleves",
        label: t("students"),
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "pendingStudents",
        label: t("pendingStudents"),
        icon: <UserLock className="w-4 h-4" />,
      },
      {
        key: "pendingPreinscriptions",
        label: t("pendingPreinscriptions"),
        icon: <ShieldAlert className="w-4 h-4" />,
      },
      {
        key: "documents",
        label: t("documents"),
        icon: <FileText className="w-4 h-4" />,
      },
      {
        key: "charts",
        label: t("charts"),
        icon: <ChartPie className="w-4 h-4" />,
      },
      {
        key: "settings",
        label: t("settings"),
        icon: <Settings className="w-4 h-4" />,
      },
      {
        key: "inviteParent",
        label: t("inviteParents"),
        icon: <User className="w-4 h-4" />,
      },
      {
        key: "inviteStaff",
        label: t("inviteStaff"),
        icon: <UserPlus className="w-4 h-4" />,
      },
    ];
  }

  if (role === "TEACHER") {
    return [
      {
        key: "myProfile",
        label: t("myProfile"),
        icon: <User className="w-4 h-4" />,
      },
      {
        key: "infos",
        label: t("myClassSubject"),
        icon: <LayoutGrid className="w-4 h-4" />,
      },
      {
        key: "eleves",
        label: t("students"),
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "notifications",
        label: t("notifications"),
        icon: <Bell className="w-4 h-4" />,
      },
      {
        key: "settings",
        label: t("settings"),
        icon: <Settings className="w-4 h-4" />,
      },
    ];
  }

  if (role === "SUPER_ADMIN") {
    return [
      {
        key: "tenants",
        label: t("schools"),
        icon: <LayoutGrid className="w-4 h-4" />,
      },
      {
        key: "chartsAdmin",
        label: t("statistics"),
        icon: <ChartPie className="w-4 h-4" />,
      },
      {
        key: "billingAdmin",
        label: t("billing"),
        icon: <Receipt className="w-4 h-4" />,
      },
      {
        key: "settingsAdmin",
        label: t("settings"),
        icon: <Settings className="w-4 h-4" />,
      },
    ];
  }

  if (role === "STAFF") {
    return [
      {
        key: "eleves",
        label: t("students"),
        icon: <Users className="w-4 h-4" />,
      },
      {
        key: "notification",
        label: t("notifications"),
        icon: <Bell className="w-4 h-4" />,
      },
      {
        key: "documents",
        label: t("documents"),
        icon: <FileText className="w-4 h-4" />,
      },
      {
        key: "settings",
        label: t("settings"),
        icon: <Settings className="w-4 h-4" />,
      },
    ];
  }

  return [];
};

export default function MobileSidebar({
  activeSection,
  setActiveSectionAction,
}: {
  activeSection: DashboardSection;
  setActiveSectionAction: Dispatch<SetStateAction<DashboardSection>>;
}) {
  const t = useTranslations("Sidebar");
  const { data: session } = useSession();
  const role = session?.user?.role;
  const sections = useSections(role);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [hasScroll, setHasScroll] = useState(false);

  useEffect(() => {
    const checkScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollHeight, clientHeight } = scrollContainerRef.current;
        setHasScroll(scrollHeight > clientHeight);
      }
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [sections]);

  return (
    <div className="fixed top-4 right-4 z-50 md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" className="cursor-pointer">
            {t("menuButton")}
          </Button>
        </SheetTrigger>
        <SheetContent className="p-4 pt-6 pr-2 h-screen" side="left">
          <div className="flex flex-col h-full">
            <SheetTitle className="text-lg font-semibold mb-4 px-2">
              {t("menu")}
            </SheetTitle>
            <div
              className="flex-1 overflow-y-auto pr-1 relative"
              ref={scrollContainerRef}
            >
              <div className="flex flex-col gap-2">
                {sections.map((section) => (
                  <Button
                    key={section.key}
                    variant={
                      activeSection === section.key ? "default" : "ghost"
                    }
                    onClick={() => setActiveSectionAction(section.key)}
                    className="flex items-center justify-start gap-2 w-full px-4 py-2 text-sm cursor-pointer"
                  >
                    {section.icon}
                    <span>{section.label}</span>
                  </Button>
                ))}
              </div>
              {hasScroll && (
                <div
                  style={{ bottom: "70px" }}
                  className="pointer-events-none absolute left-0 w-full h-20 bg-gradient-to-t from-white/90 via-white/70 to-transparent"
                />
              )}
            </div>
            <Button
              variant="outline"
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="mt-4 flex items-center justify-start gap-2 px-4 py-2 w-full cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>{t("signOut")}</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
