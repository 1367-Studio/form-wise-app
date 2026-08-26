"use client";

import { Dispatch, SetStateAction, ReactNode } from "react";
import { DashboardSection } from "../types/types";

interface SidebarBtnProps {
  label: string;
  section: DashboardSection;
  activeSection: DashboardSection;
  setActiveSection: Dispatch<SetStateAction<DashboardSection>>;
  icon?: ReactNode;
  hasNotification?: boolean | null;
}

export default function SidebarBtn({
  label,
  section,
  activeSection,
  setActiveSection,
  icon,
  hasNotification,
}: SidebarBtnProps) {
  const isActive = activeSection === section;

  return (
    <button
      onClick={() => setActiveSection(section)}
      className={`flex items-center w-full text-left px-3 py-2 rounded hover:bg-gray-200 cursor-pointer ${
        isActive ? "bg-gray-300 font-bold" : ""
      }`}
    >
      {/* Icon + Label */}
      <div className="flex items-center gap-2 flex-1">
        {icon && <span className="w-4 h-4 text-ink/85">{icon}</span>}
        <span>{label}</span>
      </div>

      {/* Notification Dot */}
      {hasNotification === true && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#fc7582] opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-[#fc7582]" />
        </span>
      )}
    </button>
  );
}
