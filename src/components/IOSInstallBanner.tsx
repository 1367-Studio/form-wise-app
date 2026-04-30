"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Share, Plus, X } from "lucide-react";

const DISMISS_KEY = "fw:iosInstallDismissed";
const DISMISS_TTL_DAYS = 14;

function isIOSDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  // iPad on iOS 13+ reports as "MacIntel" but has touch points — treat as iOS.
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)
  );
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // Safari-specific flag for legacy detection.
  return Boolean(
    (navigator as Navigator & { standalone?: boolean }).standalone
  );
}

function isDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    const age = Date.now() - ts;
    return age < DISMISS_TTL_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

export function IOSInstallBanner() {
  const t = useTranslations("IOSInstall");
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isIOSDevice()) return;
    if (isStandalone()) return;
    if (isDismissed()) return;
    // Small delay so the banner doesn't flash before the page paints.
    const timer = setTimeout(() => setShow(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // ignore
    }
    setShow(false);
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-3 pt-2 sm:left-auto sm:right-3 sm:max-w-sm">
      <div className="rounded-2xl border border-black/10 bg-white shadow-lg">
        <div className="flex items-start gap-3 p-4">
          <div className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-[#EFF6FF] text-[#2563EB]">
            <Plus className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-gray-900">{t("title")}</p>
            <p className="mt-0.5 text-xs text-gray-600">{t("subtitle")}</p>
            <ol className="mt-3 space-y-1.5 text-xs text-gray-700">
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900">1.</span>
                <span>{t("step1Before")}</span>
                <Share className="h-3.5 w-3.5 text-gray-500" />
                <span>{t("step1After")}</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="font-semibold text-gray-900">2.</span>
                <span>{t("step2")}</span>
              </li>
            </ol>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-7 w-7 flex-none items-center justify-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-700 cursor-pointer"
            aria-label={t("dismiss")}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
