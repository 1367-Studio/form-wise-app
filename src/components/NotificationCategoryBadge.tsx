"use client";

import { useTranslations } from "next-intl";
import {
  Megaphone,
  GraduationCap,
  Calendar,
  Wallet,
  Heart,
  Shield,
  Bell,
  PartyPopper,
} from "lucide-react";

export type NotificationCategory =
  | "GENERAL"
  | "ANNOUNCEMENT"
  | "ACADEMIC"
  | "ATTENDANCE"
  | "BILLING"
  | "EVENT"
  | "HEALTH"
  | "ADMIN";

const CATEGORY_STYLES: Record<
  NotificationCategory,
  { bg: string; text: string; icon: React.ComponentType<{ className?: string }> }
> = {
  GENERAL: { bg: "bg-gray-100", text: "text-gray-700", icon: Bell },
  ANNOUNCEMENT: { bg: "bg-blue-100", text: "text-blue-700", icon: Megaphone },
  ACADEMIC: { bg: "bg-emerald-100", text: "text-emerald-700", icon: GraduationCap },
  ATTENDANCE: { bg: "bg-amber-100", text: "text-amber-700", icon: Calendar },
  BILLING: { bg: "bg-orange-100", text: "text-orange-700", icon: Wallet },
  EVENT: { bg: "bg-purple-100", text: "text-purple-700", icon: PartyPopper },
  HEALTH: { bg: "bg-rose-100", text: "text-rose-700", icon: Heart },
  ADMIN: { bg: "bg-slate-100", text: "text-slate-700", icon: Shield },
};

export function NotificationCategoryBadge({
  category,
  size = "sm",
}: {
  category: NotificationCategory;
  size?: "xs" | "sm";
}) {
  const t = useTranslations("NotificationCategory");
  const style = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.GENERAL;
  const Icon = style.icon;
  const sizing =
    size === "xs"
      ? "text-[10px] px-1.5 py-0.5 gap-1"
      : "text-xs px-2 py-0.5 gap-1.5";
  const iconSize = size === "xs" ? "h-2.5 w-2.5" : "h-3 w-3";
  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${style.bg} ${style.text} ${sizing}`}
    >
      <Icon className={iconSize} />
      {t(category)}
    </span>
  );
}
