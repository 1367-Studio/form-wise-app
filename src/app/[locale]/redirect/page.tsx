"use client";

import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function RedirectPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    const role = session?.user?.role;

    if (!role) {
      router.push("/login");
      return;
    }

    switch (role) {
      case "PARENT":
        router.push("/dashboard/parent");
        break;
      case "TEACHER":
        router.push("/dashboard/teacher");
        break;
      case "DIRECTOR":
        router.push("/dashboard/director");
        break;
      default:
        router.push("/");
    }
  }, [session, status, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="flex items-center gap-2 text-gray-700 text-sm font-medium">
        <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
        Redirection en cours...
      </div>
    </div>
  );
}
