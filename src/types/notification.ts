import type { NotificationCategory } from "../components/NotificationCategoryBadge";

export type NotificationRead = {
  parentId: string;
  readAt?: string;
};

export type ParentNotification = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isGlobal: boolean;
  category?: NotificationCategory;
  student?: {
    firstName: string;
    lastName: string;
  } | null;
  readBy: NotificationRead[];
};
