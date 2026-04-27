"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isGlobal: boolean;
  teacherId?: string | null;
  student?: {
    firstName: string;
    lastName: string;
  } | null;
  teacher?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  readBy: { parentId: string; readAt: string | null }[];
  readByTeachers?: { teacherId: string; readAt: string | null }[];
};

export default function DirectorNotificationList() {
  const t = useTranslations("Notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
  }, []);

  if (notifications.length === 0) {
    return <p className="text-muted-foreground mt-6">{t("noneDirector")}</p>;
  }

  return (
    <div className="mt-8">
      {isMobile ? (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded border p-4 shadow-sm space-y-1 bg-white"
            >
              <p className="font-semibold">{n.title}</p>
              <p className="text-sm">{n.message}</p>
              <p className="text-xs text-gray-500">
                {new Date(n.createdAt).toLocaleString()}
              </p>
              <p className="text-xs">
                {n.isGlobal
                  ? t("allParents")
                  : t("studentLabel", {
                      name: `${n.student?.firstName ?? ""} ${
                        n.student?.lastName ?? ""
                      }`.trim(),
                    })}
              </p>
              <div className="text-xs">
                {n.isGlobal ? (
                  <span className="text-gray-600">
                    {t("parentsRead", { count: n.readBy.length })}
                  </span>
                ) : (
                  <span
                    className={`px-2 py-0.5 rounded-full font-medium ${
                      n.readBy.length > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {n.readBy.length > 0 ? t("read") : t("unread")}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-muted text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 text-left">{t("headerTitle")}</th>
                <th className="px-4 py-3 text-left">{t("headerRecipient")}</th>
                <th className="px-4 py-3 text-left">{t("headerStatus")}</th>
                <th className="px-4 py-3 text-left">{t("headerDate")}</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {notifications.map((n) => (
                <tr key={n.id} className="hover:bg-muted/20">
                  <td className="px-4 py-2 font-medium">{n.title}</td>
                  <td className="px-4 py-2">
                    {n.isGlobal
                      ? n.teacherId
                        ? t("allTeachers")
                        : t("allParents")
                      : n.student
                        ? `${n.student.firstName} ${n.student.lastName}`
                        : n.teacher?.user
                          ? `${n.teacher.user.firstName} ${n.teacher.user.lastName}`
                          : t("privateNotification")}
                  </td>
                  <td className="px-4 py-2">
                    {n.teacherId || n.teacher ? (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          n.readByTeachers && n.readByTeachers.length > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {n.readByTeachers && n.readByTeachers.length > 0
                          ? t("read")
                          : t("unread")}
                      </span>
                    ) : n.isGlobal ? (
                      <span className="text-xs text-gray-600">
                        {t("parentsRead", { count: n.readBy.length })}
                      </span>
                    ) : (
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          n.readBy.length > 0
                            ? "bg-green-100 text-green-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {n.readBy.length > 0 ? t("read") : t("unread")}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-xs text-gray-500">
                    {new Date(n.createdAt).toLocaleString()}
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
