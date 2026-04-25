"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTranslations } from "next-intl";

type InvitedParent = {
  id: string;
  email: string;
  used: boolean;
  createdAt: string;
  firstName?: string | null;
};

export function InvitedParentList() {
  const t = useTranslations("InvitedParents");
  const [list, setList] = useState<InvitedParent[]>([]);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    fetch("/api/invited-parents")
      .then((res) => res.json())
      .then((data) => {
        setList(data);
      });
  }, []);

  if (list.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("emptyMessage")}</p>;
  }

  if (isMobile) {
    return (
      <div className="grid gap-4">
        {list.map((item) => (
          <Card key={item.id}>
            <CardContent className="p-4 space-y-2">
              <p className="font-medium">{item.email}</p>
              {item.used ? (
                <span className="inline-flex items-center rounded-full bg-[#e8f7ee] px-2 py-0.5 text-xs font-medium text-[#2fbf6c] ring-1 ring-inset ring-green-600/20">
                  {t("accountCreated")}
                </span>
              ) : (
                <span className="inline-flex items-center rounded-full bg-[#fdecec] px-2 py-0.5 text-xs font-medium text-[#e3342f] ring-1 ring-inset ring-red-600/20">
                  {t("pending")}
                </span>
              )}
              <p className="text-xs text-muted-foreground">
                {t("invitedAt", {
                  date: new Date(item.createdAt).toLocaleDateString(),
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-md border shadow-sm mt-6">
      <table className="min-w-full text-sm">
        <thead className="bg-gray-50 dark:bg-zinc-800">
          <tr className="text-left text-gray-500 dark:text-gray-300 uppercase text-xs">
            <th className="px-4 py-3">{t("headerFirstName")}</th>
            <th className="px-4 py-3">{t("headerEmail")}</th>
            <th className="px-4 py-3">{t("headerStatus")}</th>
            <th className="px-4 py-3">{t("headerInvitedAt")}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
          {list.map((item) => (
            <tr
              key={item.id}
              className="hover:bg-gray-50 dark:hover:bg-zinc-700"
            >
              <td className="px-4 py-3 font-medium text-black dark:text-white">
                {item.firstName || t("noValue")}
              </td>
              <td className="px-4 py-3 font-medium text-black dark:text-white">
                {item.email}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {item.used ? (
                  <span className="inline-flex items-center rounded-full bg-[#e8f7ee] px-2 py-0.5 text-xs font-medium text-[#2fbf6c] ring-1 ring-inset ring-green-600/20">
                    {t("accountCreated")}
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-[#fdecec] px-2 py-0.5 text-xs font-medium text-[#e3342f] ring-1 ring-inset ring-red-600/20">
                    {t("pending")}
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                {new Date(item.createdAt).toLocaleDateString()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
