"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import NotificationCard from "./NotificationCard";
import { ParentNotification } from "../types/notification";

export default function ParentNotificationList() {
  const t = useTranslations("Notifications");
  const [notifications, setNotifications] = useState<ParentNotification[]>([]);

  useEffect(() => {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((data) => setNotifications(data.notifications || []));
  }, []);

  const markAsRead = async (id: string) => {
    await fetch("/api/notifications/read", {
      method: "POST",
      body: JSON.stringify({ notificationId: id }),
      headers: { "Content-Type": "application/json" },
    });

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readBy: [...n.readBy, { parentId: "ok" }] } : n
      )
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold mb-4">{t("title")}</h2>

      {notifications.length === 0 ? (
        <h1 className="text-gray-500 text-sm italic">{t("noneParent")}</h1>
      ) : (
        <NotificationCard
          notifications={notifications}
          onMarkAsRead={markAsRead}
        />
      )}
    </div>
  );
}
