"use client";

import { useState } from "react";
import { cn } from "../lib/utils";
import Image from "next/image";
import { Layers, List, BarChart2, Users, LayoutGrid, Bell } from "lucide-react";
import { useTranslations } from "next-intl";

export default function TabsShowcase() {
  const t = useTranslations("Tabs");

  const tabs = [
    {
      id: "eleves",
      label: t("students"),
      icon: <Users className="w-4 h-4" />,
      imageUrl:
        "https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/2fd0af2464672b561c6723175f359c3274473381-2868x1598.png",
    },
    {
      id: "classes",
      label: t("classes"),
      icon: <LayoutGrid className="w-4 h-4" />,
      imageUrl:
        "https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/42483ea186e093dc722e37d638cf07d825273595-5114x2624.png",
    },
    {
      id: "dashboard-parents",
      label: t("parentsDashboard"),
      icon: <BarChart2 className="w-4 h-4" />,
      imageUrl:
        "https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/1a193e97e1f8408d64ecf8c4304687d2b513748f-5104x2528.png",
    },
    {
      id: "documents",
      label: t("documents"),
      icon: <Layers className="w-4 h-4" />,
      imageUrl:
        "https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/247ee8768712296dfde4d3faaaa15d2939b4988f-5100x2514.png",
    },
    {
      id: "notifications",
      label: t("notifications"),
      icon: <Bell className="w-4 h-4" />,
      imageUrl:
        "https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/c3bd9658b167921317c2de2e7a1818161808a4b7-5110x2526.png",
    },
    {
      id: "liste-de-professeurs",
      label: t("teachersList"),
      icon: <List className="w-4 h-4" />,
      imageUrl:
        "https://cdn.sanity.io/media-libraries/mllo1PEUbcwG/images/0169df9b3ff785337c160a6e7b27c872f12b3398-5064x2432.png",
    },
  ];

  const [activeTab, setActiveTab] = useState("eleves");
  const active = tabs.find((tab) => tab.id === activeTab);

  return (
    <div className="w-full mt-8">
      <div className="flex flex-wrap gap-4 justify-center">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium cursor-pointer transition",
              activeTab === tab.id
                ? "bg-gray-100 text-black shadow-sm"
                : "bg-white text-gray-700 hover:bg-gray-50"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {active?.imageUrl && (
        <div className="mt-16 flow-root sm:mt-24">
          <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4">
            <Image
              alt={t("screenshotAlt", { label: active.label })}
              src={active.imageUrl}
              width={2432}
              height={1442}
              className="rounded-md shadow-2xl ring-1 ring-gray-900/10"
            />
          </div>
        </div>
      )}
    </div>
  );
}
