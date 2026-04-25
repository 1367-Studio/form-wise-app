"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { UserPen, UserX } from "lucide-react";
import { useTranslations } from "next-intl";
import InviteTeacherForm from "./InviteTeacherForm";
import TeacherForm from "./TeacherForm";
import CenteredSpinner from "./CenteredSpinner";

export type Teacher = {
  id: string;
  firstName: string;
  lastName: string;
  subject?: {
    id: string;
    name: string;
  };
  class?: {
    id: string;
    name: string;
  };
  user: {
    firstName: string;
    lastName: string;
  };
};

export default function TeacherList({
  visible = false,
}: {
  visible?: boolean;
}) {
  const t = useTranslations("TeacherList");
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [showList, setShowList] = useState(visible);
  const [isMobile, setIsMobile] = useState(false);

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/teachers", {
        credentials: "include",
      });
      const data = await res.json();
      setTeachers(data.teachers || []);
    } catch (error) {
      console.error("Teachers fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/teachers/${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setTeachers((prev) => prev.filter((tch) => tch.id !== id));
      }
    } catch (error) {
      console.error("Teacher delete error:", error);
    }
  };

  const handleEdit = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleCreatedOrUpdated = (updatedTeacher: Teacher) => {
    setTeachers((prev) => {
      const exists = prev.find((tch) => tch.id === updatedTeacher.id);
      if (exists) {
        return prev.map((tch) =>
          tch.id === updatedTeacher.id ? updatedTeacher : tch
        );
      } else {
        return [...prev, updatedTeacher];
      }
    });
    setSelectedTeacher(null);
  };

  if (loading) return <CenteredSpinner label={t("loading")} />;

  return (
    <div className="mt-6 flex flex-col gap-6">
      <InviteTeacherForm onInvited={fetchTeachers} />

      {selectedTeacher && (
        <TeacherForm
          teacher={selectedTeacher}
          onCreated={handleCreatedOrUpdated}
        />
      )}

      <Button
        className="cursor-pointer"
        onClick={() => setShowList(!showList)}
        variant="outline"
      >
        {showList ? t("hideList") : t("showList")}
      </Button>

      {showList &&
        (isMobile ? (
          <div className="flex flex-col gap-4">
            {teachers.map((teacher) => (
              <div key={teacher.id} className="border p-4 rounded-md shadow-sm">
                <p className="font-semibold">
                  {teacher.user.firstName} {teacher.user.lastName}
                </p>
                <p className="text-sm text-muted-foreground">
                  {t("subjectLabel")} {teacher.subject?.name || t("noValue")}{" "}
                  <br />
                  {t("classLabel")} {teacher.class?.name || t("noValue")}
                </p>
                <div className="mt-3 flex justify-end gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleEdit(teacher)}
                    className="cursor-pointer"
                  >
                    <UserPen className="h-4 w-4 mr-1" />
                    {t("edit")}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleDelete(teacher.id)}
                    className="cursor-pointer"
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    {t("delete")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-md border shadow-sm">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 dark:bg-zinc-800">
                <tr className="text-left text-gray-500 dark:text-gray-300 uppercase text-xs">
                  <th className="px-4 py-3">{t("headerTeacher")}</th>
                  <th className="px-4 py-3">{t("headerSubject")}</th>
                  <th className="px-4 py-3">{t("headerClass")}</th>
                  <th className="px-4 py-3 text-right">{t("headerActions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
                {teachers.map((teacher) => (
                  <tr
                    key={teacher.id}
                    className="hover:bg-gray-50 dark:hover:bg-zinc-700"
                  >
                    <td className="px-4 py-3 font-medium text-black dark:text-white">
                      {teacher.user?.firstName} {teacher.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {teacher.subject?.name || t("noValue")}
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">
                      {teacher.class?.name || t("noValue")}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEdit(teacher)}
                        className="cursor-pointer"
                      >
                        <UserPen className="h-4 w-4 mr-1" />
                        {t("edit")}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(teacher.id)}
                        className="cursor-pointer"
                      >
                        <UserX className="h-4 w-4 mr-1" />
                        {t("delete")}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))}
    </div>
  );
}
