"use client";

import { useTranslations } from "next-intl";
import { Users } from "lucide-react";
import { useSelectedChild } from "@/contexts/SelectedChildContext";

/**
 * Horizontal pill switcher for the parent's children. Hides itself when
 * there's only one child (no value to render a single tab) or zero.
 */
export function ChildSwitcher() {
  const t = useTranslations("ChildSwitcher");
  const { children, selectedChildId, setSelectedChildId, loading } =
    useSelectedChild();

  if (loading) return null;
  if (children.length <= 1) return null;

  return (
    <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
      <Pill
        active={selectedChildId === null}
        onClick={() => setSelectedChildId(null)}
      >
        <Users className="h-3.5 w-3.5" />
        <span>{t("all")}</span>
      </Pill>
      {children.map((child) => {
        const initials =
          (child.firstName[0] ?? "") + (child.lastName[0] ?? "");
        return (
          <Pill
            key={child.id}
            active={selectedChildId === child.id}
            onClick={() => setSelectedChildId(child.id)}
          >
            <span
              className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-semibold ${
                selectedChildId === child.id
                  ? "bg-white text-[#2563EB]"
                  : "bg-black text-white"
              }`}
            >
              {initials}
            </span>
            <span>{child.firstName}</span>
          </Pill>
        );
      })}
    </div>
  );
}

function Pill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex flex-none items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors cursor-pointer ${
        active
          ? "border-[#2563EB] bg-[#2563EB] text-white"
          : "border-black/10 bg-white text-gray-700 hover:border-black/20"
      }`}
    >
      {children}
    </button>
  );
}
