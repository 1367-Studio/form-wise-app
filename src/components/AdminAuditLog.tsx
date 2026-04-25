"use client";

import { useState } from "react";
import useSWR from "swr";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

type AuditEvent = {
  id: string;
  actorUserId: string | null;
  actorEmail: string | null;
  actorRole: string | null;
  action: string;
  targetType: string | null;
  targetId: string | null;
  metadata: unknown;
  createdAt: string;
};

const fetcher = (url: string) => fetch(url).then((r) => r.json());

const ACTIONS = [
  "auth.password_changed",
  "auth.signed_out_everywhere",
  "tenant.status_changed",
  "broadcast.sent",
  "impersonation.started",
  "impersonation.ended",
];

function actionKey(action: string) {
  return (
    "action" +
    action
      .split(/[._]/)
      .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
      .join("")
  );
}

export default function AdminAuditLog() {
  const t = useTranslations("AdminAudit");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const url =
    actionFilter === "all"
      ? "/api/superadmin/audit-log"
      : `/api/superadmin/audit-log?action=${encodeURIComponent(actionFilter)}`;
  const { data, error, isLoading } = useSWR<{ events: AuditEvent[] }>(
    url,
    fetcher,
    { refreshInterval: 30_000 }
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">{t("title")}</h1>
        <p className="text-sm text-gray-500">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-3">
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[280px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAll")}</SelectItem>
            {ACTIONS.map((a) => (
              <SelectItem key={a} value={a}>
                {t(actionKey(a))}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="h-64 animate-pulse rounded-xl bg-gray-100" />
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {t("loadError")}
        </div>
      ) : !data?.events?.length ? (
        <div className="rounded-xl border border-black/10 bg-white p-8 text-center text-sm text-gray-500">
          {t("empty")}
        </div>
      ) : (
        <div className="rounded-xl border border-black/10 bg-white overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-black/10">
              <tr>
                <th className="px-4 py-3">{t("headerWhen")}</th>
                <th className="px-4 py-3">{t("headerActor")}</th>
                <th className="px-4 py-3">{t("headerAction")}</th>
                <th className="px-4 py-3">{t("headerTarget")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/5">
              {data.events.map((evt) => (
                <tr key={evt.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3 text-xs text-gray-500 whitespace-nowrap">
                    {new Date(evt.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-sm text-gray-900">
                      {evt.actorEmail ?? "—"}
                    </div>
                    {evt.actorRole && (
                      <div className="text-xs text-gray-500">
                        {evt.actorRole}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-[#fef1ea] px-2 py-0.5 text-xs font-medium text-[#f84a00]">
                      {t(actionKey(evt.action))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    <div>
                      {evt.targetType}
                      {evt.targetId ? `:${evt.targetId.slice(0, 8)}` : ""}
                    </div>
                    {evt.metadata != null && (
                      <pre className="mt-1 text-[10px] text-gray-500 max-w-md whitespace-pre-wrap">
                        {JSON.stringify(evt.metadata)}
                      </pre>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
