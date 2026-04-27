"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type State =
  | "unsupported" // Browser/runtime can't do web push
  | "denied" // User permanently blocked notifications
  | "idle" // Default state — user hasn't opted in yet
  | "subscribing"
  | "enabled"
  | "disabling";

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

export function EnableNotificationsButton() {
  const t = useTranslations("PushNotifications");
  const [state, setState] = useState<State>("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("denied");
      return;
    }
    // Check if we already have a subscription so the button shows the right
    // state on refresh / re-mount.
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub ? "enabled" : "idle"))
      .catch(() => setState("idle"));
  }, []);

  const subscribe = async () => {
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      toast.error(t("notConfigured"));
      return;
    }
    setState("subscribing");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "denied" : "idle");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey)
          .buffer as ArrayBuffer,
      });
      const json = sub.toJSON() as {
        endpoint: string;
        keys: { p256dh: string; auth: string };
      };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) {
        await sub.unsubscribe().catch(() => {});
        toast.error(t("subscribeFailed"));
        setState("idle");
        return;
      }
      setState("enabled");
      toast.success(t("enabled"));
    } catch (err) {
      console.error(err);
      toast.error(t("subscribeFailed"));
      setState("idle");
    }
  };

  const unsubscribe = async () => {
    setState("disabling");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setState("idle");
      toast.success(t("disabled"));
    } catch {
      setState("enabled");
      toast.error(t("unsubscribeFailed"));
    }
  };

  if (state === "unsupported") {
    return (
      <p className="text-xs text-gray-500 italic">{t("unsupported")}</p>
    );
  }

  if (state === "denied") {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800">
        {t("denied")}
      </div>
    );
  }

  if (state === "enabled") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={unsubscribe}
        disabled={state !== "enabled"}
        className="cursor-pointer"
      >
        <BellOff className="mr-2 h-4 w-4" />
        {t("disable")}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      onClick={subscribe}
      disabled={state === "subscribing" || state === "disabling"}
      className="cursor-pointer"
    >
      {state === "subscribing" ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Bell className="mr-2 h-4 w-4" />
      )}
      {state === "subscribing" ? t("enabling") : t("enable")}
    </Button>
  );
}
