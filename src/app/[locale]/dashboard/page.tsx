"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status !== "authenticated") return;

    const role = session.user?.role;

    if (role === "SUPER_ADMIN") {
      router.replace("/admin/dashboard");
    } else if (role === "DIRECTOR") {
      router.replace("/dashboard/director");
    } else if (role === "TEACHER") {
      router.replace("/dashboard/teacher");
    } else {
      router.replace("/dashboard/parent");
    }
  }, [status, session, router]);

  return null;
}
