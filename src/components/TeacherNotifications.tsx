"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import NotificationCardTeacher from "../components/NotificationCardTeacher";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
} from "@/components/ui/pagination";

type NotificationReadTeacher = {
  teacherId: string;
  readAt?: string;
};

type Notification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  readByTeachers: NotificationReadTeacher[];
  isGlobal: boolean;
};

export default function TeacherNotifications() {
  const t = useTranslations("Notifications");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const perPage = 5;

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await fetch("/api/notifications");
        const data = await res.json();
        setNotifications(data.notifications || []);
      } catch (err) {
        console.error("Notifications fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id: string) => {
    await fetch("/api/notifications/read/teacher", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationId: id }),
    });
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, readByTeachers: [{ teacherId: "me" }] } : n
      )
    );
  };

  const paginated = notifications.slice((page - 1) * perPage, page * perPage);
  const totalPages = Math.ceil(notifications.length / perPage);

  return (
    <div className="space-y-4">
      {loading ? (
        Array.from({ length: perPage }).map((_, idx) => (
          <Skeleton key={idx} className="w-full h-[120px] rounded" />
        ))
      ) : (
        <>
          {paginated.map((notification) => (
            <NotificationCardTeacher
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
            />
          ))}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => (p > 1 ? p - 1 : p))}
                    className={
                      page === 1 ? "pointer-events-none opacity-50" : ""
                    }
                  />
                </PaginationItem>

                <PaginationItem className="px-4 text-sm text-muted-foreground">
                  {t("page", { current: page, total: totalPages })}
                </PaginationItem>

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => (p < totalPages ? p + 1 : p))}
                    className={
                      page === totalPages
                        ? "pointer-events-none opacity-50"
                        : ""
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
}
