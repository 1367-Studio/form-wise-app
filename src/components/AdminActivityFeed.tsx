"use client";

import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  Building2,
  UserPlus,
  FileText,
  CheckCircle2,
  ChevronRight,
} from "lucide-react";

type ActivityType =
  | "tenant_signup"
  | "preregistration_submitted"
  | "subscription_active"
  | "user_joined";

type ActivityEvent = {
  id: string;
  type: ActivityType;
  at: string;
  title: string;
  subtitle?: string;
  tenantId?: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const iconForType: Record<ActivityType, React.ReactNode> = {
  tenant_signup: <Building2 className="h-4 w-4" />,
  subscription_active: <CheckCircle2 className="h-4 w-4 text-green-600" />,
  preregistration_submitted: <FileText className="h-4 w-4 text-amber-600" />,
  user_joined: <UserPlus className="h-4 w-4 text-[#f84a00]" />,
};

export default function AdminActivityFeed() {
  const t = useTranslations("AdminActivity");
  const { data, error, isLoading } = useSWR<{ events: ActivityEvent[] }>(
    "/api/superadmin/activity",
    fetcher,
    { refreshInterval: 60_000 }
  );

  if (isLoading) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500 mb-4">
          {t("title")}
        </h3>
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="h-12 animate-pulse rounded-md bg-gray-100"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("loadError")}
      </div>
    );
  }

  const events = data?.events ?? [];
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-black/10 bg-white p-6 text-sm text-gray-500">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-black/10 bg-white">
      <div className="border-b border-black/10 px-6 py-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.12em] text-gray-500">
          {t("title")}
        </h3>
      </div>
      <ul className="divide-y divide-black/5">
        {events.map((evt) => (
          <li key={evt.id}>
            <a
              href={evt.tenantId ? `/admin/tenant/${evt.tenantId}` : "#"}
              className="flex items-center gap-3 px-6 py-3 transition-colors hover:bg-gray-50"
            >
              <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gray-100">
                {iconForType[evt.type]}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {evt.title}
                  </span>
                  <span className="text-xs text-gray-400">·</span>
                  <span className="text-xs text-gray-500 truncate">
                    {t(evt.type)}
                  </span>
                </div>
                {evt.subtitle && (
                  <div className="text-xs text-gray-500 truncate">
                    {evt.subtitle}
                  </div>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {timeAgo(evt.at, t)}
              </span>
              {evt.tenantId && (
                <ChevronRight className="h-4 w-4 text-gray-300" />
              )}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function timeAgo(iso: string, t: (key: string, vars?: Record<string, string | number>) => string) {
  const ms = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(ms / 60_000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minutesAgo", { n: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hoursAgo", { n: hours });
  const days = Math.floor(hours / 24);
  return t("daysAgo", { n: days });
}
