"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useSession } from "next-auth/react";
import { Bell, CheckCheck, Megaphone, User2, Inbox } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionSkeleton } from "./SectionSkeleton";
import { NotificationCategoryBadge } from "./NotificationCategoryBadge";
import { ParentNotification } from "../types/notification";

type Filter = "all" | "unread" | string;

function dayBucket(iso: string): "today" | "yesterday" | "thisWeek" | "older" {
  const d = new Date(iso);
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  );
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 7);

  if (d >= startOfToday) return "today";
  if (d >= startOfYesterday) return "yesterday";
  if (d >= startOfWeek) return "thisWeek";
  return "older";
}

export default function ParentNotificationsSection() {
  const t = useTranslations("ParentNotifications");
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [notifications, setNotifications] = useState<ParentNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [marking, setMarking] = useState(false);

  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();
      setNotifications(data.notifications || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifs();
  }, []);

  const isReadByMe = useCallback(
    (n: ParentNotification) => n.readBy.some((r) => r.parentId === userId),
    [userId]
  );

  const unreadCount = useMemo(
    () => notifications.filter((n) => !isReadByMe(n)).length,
    [notifications, isReadByMe]
  );

  const studentChips = useMemo(() => {
    const map = new Map<string, string>();
    for (const n of notifications) {
      if (!n.isGlobal && n.student) {
        const key = `${n.student.firstName}-${n.student.lastName}`;
        map.set(key, `${n.student.firstName} ${n.student.lastName}`);
      }
    }
    return Array.from(map, ([key, label]) => ({ key, label }));
  }, [notifications]);

  const filtered = useMemo(() => {
    if (filter === "all") return notifications;
    if (filter === "unread")
      return notifications.filter((n) => !isReadByMe(n));
    return notifications.filter(
      (n) =>
        n.student && `${n.student.firstName}-${n.student.lastName}` === filter
    );
  }, [notifications, filter, isReadByMe]);

  const grouped = useMemo(() => {
    const groups: Record<string, ParentNotification[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };
    for (const n of filtered) {
      groups[dayBucket(n.createdAt)].push(n);
    }
    return groups;
  }, [filtered]);

  const markOne = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              readBy: [...n.readBy, { parentId: userId ?? "self" }],
            }
          : n
      )
    );
    await fetch("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ notificationId: id }),
      headers: { "Content-Type": "application/json" },
    });
  };

  const markAll = async () => {
    setMarking(true);
    try {
      const res = await fetch("/api/notifications/read-all", {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(t("markedAllToast", { count: data.marked ?? 0 }));
        fetchNotifs();
      } else {
        toast.error(data?.error || t("markFailed"));
      }
    } finally {
      setMarking(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-sm text-gray-500">
            {unreadCount > 0
              ? t("unreadSubtitle", { count: unreadCount })
              : t("allRead")}
          </p>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={markAll}
          disabled={marking || unreadCount === 0}
        >
          <CheckCheck className="mr-2 h-4 w-4" />
          {marking ? t("marking") : t("markAllRead")}
        </Button>
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2">
        <FilterPill
          active={filter === "all"}
          onClick={() => setFilter("all")}
          count={notifications.length}
        >
          {t("filterAll")}
        </FilterPill>
        <FilterPill
          active={filter === "unread"}
          onClick={() => setFilter("unread")}
          count={unreadCount}
          highlight
        >
          {t("filterUnread")}
        </FilterPill>
        {studentChips.map((c) => (
          <FilterPill
            key={c.key}
            active={filter === c.key}
            onClick={() => setFilter(c.key)}
          >
            {c.label}
          </FilterPill>
        ))}
      </div>

      {loading ? (
        <SectionSkeleton variant="list" rows={5} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-black/15 bg-white px-6 py-16 text-center">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <Inbox className="h-6 w-6" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900">
            {filter === "unread" ? t("emptyAllRead") : t("emptyTitle")}
          </h2>
          <p className="mt-1 max-w-sm text-sm text-gray-500">
            {filter === "unread"
              ? t("emptyAllReadHint")
              : t("emptySubtitle")}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {(["today", "yesterday", "thisWeek", "older"] as const).map((key) =>
            grouped[key].length ? (
              <div key={key}>
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {t(`group${key.charAt(0).toUpperCase() + key.slice(1)}`)}
                </h3>
                <ul className="space-y-2">
                  {grouped[key].map((n) => (
                    <NotificationItem
                      key={n.id}
                      notification={n}
                      isRead={isReadByMe(n)}
                      onMarkRead={() => markOne(n.id)}
                      t={t}
                    />
                  ))}
                </ul>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}

function FilterPill({
  active,
  onClick,
  count,
  highlight,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count?: number;
  highlight?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium cursor-pointer transition-colors ${
        active
          ? "border-[#2563EB] bg-[#2563EB] text-white"
          : "border-black/10 bg-white text-gray-700 hover:border-[#2563EB]/30 hover:text-[#2563EB]"
      }`}
    >
      {children}
      {count !== undefined && count > 0 && (
        <span
          className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
            active
              ? "bg-white/20 text-white"
              : highlight
              ? "bg-[#EFF6FF] text-[#2563EB]"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function NotificationItem({
  notification,
  isRead,
  onMarkRead,
  t,
}: {
  notification: ParentNotification;
  isRead: boolean;
  onMarkRead: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const { title, message, createdAt, isGlobal, student, category } =
    notification;
  return (
    <li
      className={`group flex items-start gap-3 rounded-xl border p-4 transition-colors ${
        isRead
          ? "border-black/10 bg-white"
          : "border-[#2563EB]/20 bg-[#EFF6FF]/40"
      }`}
    >
      <div
        className={`mt-1 flex h-8 w-8 flex-none items-center justify-center rounded-full ${
          isGlobal
            ? "bg-blue-50 text-blue-600"
            : "bg-[#EFF6FF] text-[#2563EB]"
        }`}
      >
        {isGlobal ? (
          <Megaphone className="h-4 w-4" />
        ) : (
          <User2 className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          {!isRead && (
            <span className="h-2 w-2 rounded-full bg-[#2563EB]" />
          )}
          <p className="truncate text-sm font-semibold text-gray-900">
            {title}
          </p>
          {category && category !== "GENERAL" && (
            <NotificationCategoryBadge category={category} size="xs" />
          )}
          {isGlobal ? (
            <Badge
              variant="outline"
              className="border-blue-100 bg-blue-50 text-[10px] text-blue-700"
            >
              {t("globalTag")}
            </Badge>
          ) : student ? (
            <Badge
              variant="outline"
              className="border-black/10 text-[10px] text-gray-700"
            >
              {student.firstName} {student.lastName}
            </Badge>
          ) : null}
        </div>
        <p className="mt-1 text-sm text-gray-700">{message}</p>
        <p className="mt-1.5 text-xs text-gray-500">
          {new Date(createdAt).toLocaleString()}
        </p>
      </div>
      {!isRead && (
        <Button
          size="sm"
          variant="ghost"
          className="cursor-pointer text-[#2563EB] hover:bg-[#EFF6FF] hover:text-[#2563EB]"
          onClick={onMarkRead}
        >
          <Bell className="mr-1 h-3.5 w-3.5" />
          {t("markRead")}
        </Button>
      )}
    </li>
  );
}
