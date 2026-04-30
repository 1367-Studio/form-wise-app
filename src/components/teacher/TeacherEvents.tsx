"use client";

import useSWR from "swr";
import { useTranslations, useLocale } from "next-intl";
import { format, isAfter, isSameMonth } from "date-fns";
import { fr, enGB, ptBR, es } from "date-fns/locale";
import {
  Calendar,
  CalendarRange,
  CalendarClock,
  MapPin,
} from "lucide-react";
import { SectionSkeleton } from "@/components/SectionSkeleton";

/* ── locale map ── */
const dateLocales = { fr, en: enGB, pt: ptBR, es } as const;
type DateLocale = (typeof dateLocales)[keyof typeof dateLocales];

/* ── types ── */
type EventType = "GENERAL" | "MEETING" | "HOLIDAY" | "EXAM" | "TRIP";

type SchoolEvent = {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  type: EventType;
  createdAt: string;
};

type EventsResponse = { events: SchoolEvent[]; total: number };

/* ── constants ── */
const TYPE_BADGE: Record<EventType, string> = {
  MEETING: "bg-blue-100 text-blue-700",
  HOLIDAY: "bg-emerald-100 text-emerald-700",
  EXAM: "bg-amber-100 text-amber-700",
  TRIP: "bg-purple-100 text-purple-700",
  GENERAL: "bg-gray-100 text-gray-700",
};

const TYPE_BORDER: Record<EventType, string> = {
  MEETING: "border-l-[#2563EB]",
  HOLIDAY: "border-l-[#10B981]",
  EXAM: "border-l-[#F59E0B]",
  TRIP: "border-l-[#8B5CF6]",
  GENERAL: "border-l-[#6B7280]",
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/* ── helpers ── */
function groupByMonth(
  events: SchoolEvent[],
  locale: DateLocale,
): { month: string; events: SchoolEvent[] }[] {
  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const groups = new Map<string, SchoolEvent[]>();
  for (const event of sorted) {
    const key = format(new Date(event.startDate), "MMMM yyyy", { locale });
    const list = groups.get(key) ?? [];
    list.push(event);
    groups.set(key, list);
  }
  return Array.from(groups, ([month, events]) => ({ month, events }));
}

/* ── component ── */
export default function TeacherEvents() {
  const t = useTranslations("TeacherEvents");
  const locale = useLocale() as keyof typeof dateLocales;
  const dateFnsLocale = dateLocales[locale] ?? fr;

  const { data, error, isLoading } = useSWR<EventsResponse>(
    "/api/teacher/events",
    fetcher,
  );

  function typeLabel(type: EventType) {
    const map: Record<EventType, string> = {
      GENERAL: t("typeGeneral"),
      MEETING: t("typeMeeting"),
      HOLIDAY: t("typeHoliday"),
      EXAM: t("typeExam"),
      TRIP: t("typeTrip"),
    };
    return map[type];
  }

  /* ── loading ── */
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
          <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
        </div>
        <SectionSkeleton variant="stats" rows={3} />
        <SectionSkeleton variant="list" rows={4} />
      </div>
    );
  }

  /* ── error ── */
  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {t("loadError")}
      </div>
    );
  }

  const now = new Date();
  const events = data?.events ?? [];
  const sorted = [...events].sort(
    (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
  );
  const upcoming = sorted.filter((e) => isAfter(new Date(e.startDate), now));
  const thisMonth = sorted.filter((e) =>
    isSameMonth(new Date(e.startDate), now),
  );
  const nextEvent = upcoming[0];
  const grouped = groupByMonth(events, dateFnsLocale);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">{t("title")}</h1>
        <p className="mt-1 text-sm text-gray-500">{t("description")}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <Calendar className="h-4 w-4" />
            {t("upcoming")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {upcoming.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CalendarRange className="h-4 w-4" />
            {t("thisMonth")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {thisMonth.length}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <CalendarClock className="h-4 w-4" />
            {t("nextEvent")}
          </div>
          <p className="mt-2 text-2xl font-semibold text-gray-900">
            {nextEvent
              ? format(new Date(nextEvent.startDate), "d MMM yyyy", {
                  locale: dateFnsLocale,
                })
              : "\u2014"}
          </p>
        </div>
      </div>

      {/* Events list grouped by month */}
      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
          <p className="text-sm text-gray-500">{t("noEvents")}</p>
        </div>
      ) : (
        <div className="space-y-8">
          {grouped.map((group) => (
            <div key={group.month}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                {group.month}
              </h3>
              <div className="space-y-3">
                {group.events.map((event) => (
                  <div
                    key={event.id}
                    className={`rounded-xl border border-gray-200 border-l-4 bg-white p-4 ${TYPE_BORDER[event.type]}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-semibold text-gray-900">
                          {event.title}
                        </h4>
                        <p className="mt-1 text-sm text-gray-600">
                          {format(
                            new Date(event.startDate),
                            "EEEE d MMMM yyyy '\u00e0' HH:mm",
                            { locale: fr },
                          )}
                          {" \u2014 "}
                          {format(
                            new Date(event.endDate),
                            "EEEE d MMMM yyyy '\u00e0' HH:mm",
                            { locale: fr },
                          )}
                        </p>
                        {event.location && (
                          <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.location}
                          </p>
                        )}
                        {event.description && (
                          <p className="mt-1 text-sm text-gray-600">
                            {event.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${TYPE_BADGE[event.type]}`}
                      >
                        {typeLabel(event.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
