"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { UserCheck, Clock } from "lucide-react";
import { useTranslations } from "next-intl";
import EmptyState from "./EmptyState";
import { useDebounce } from "../../src/hooks/useDebounce";
import EditStaffModal from "./EditStaffModal";
import type { Staff } from "./EditStaffModal";
import DeleteStaffButton from "./DeleteStaffButton";
import Pagination from "./Pagination";
import { useSearchParams, useRouter } from "next/navigation";

export type InvitedStaff = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  roleLabel: string;
  createdAt: string;
  accepted: boolean;
};

type InvitedStaffListProps = {
  staffList: InvitedStaff[];
  setStaffListAction: React.Dispatch<React.SetStateAction<InvitedStaff[]>>;
};

export default function InvitedStaffList({
  staffList,
  setStaffListAction,
}: InvitedStaffListProps) {
  const t = useTranslations("InvitedStaff");
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  const [sortOption, setSortOption] = useState("created-desc");
  const searchParams = useSearchParams();
  const router = useRouter();
  const pageFromUrl = parseInt(searchParams?.get("page") || "1", 10);
  const [currentPage, setCurrentPage] = useState(pageFromUrl);
  const itemsPerPage = 10;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", page.toString());
    router.push(`?${params.toString()}`);
  };

  const filteredAndSortedList = useMemo(() => {
    const q = debouncedSearchQuery.toLowerCase();
    const filtered = staffList.filter(
      (staff) =>
        staff.firstName.toLowerCase().includes(q) ||
        staff.lastName.toLowerCase().includes(q) ||
        staff.email.toLowerCase().includes(q)
    );

    switch (sortOption) {
      case "created-asc":
        filtered.sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        break;
      case "created-desc":
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case "role":
        filtered.sort((a, b) => a.roleLabel.localeCompare(b.roleLabel));
        break;
    }

    return filtered;
  }, [staffList, debouncedSearchQuery, sortOption]);

  const totalPages = Math.ceil(filteredAndSortedList.length / itemsPerPage);
  const paginatedList = filteredAndSortedList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (staffList.length === 0) {
    return (
      <EmptyState
        message={t("emptyMessage")}
        actionLabel={t("emptyAction")}
        onAction={() => {
          /* CTA hint only */
        }}
      />
    );
  }

  const renderBadge = (accepted: boolean) =>
    accepted ? (
      <Badge variant="default" className="flex items-center gap-1">
        <UserCheck className="w-4 h-4" /> {t("validated")}
      </Badge>
    ) : (
      <Badge variant="outline" className="flex items-center gap-1">
        <Clock className="w-4 h-4" /> {t("pending")}
      </Badge>
    );

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <Input
          placeholder={t("searchPlaceholder")}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:max-w-xs"
        />
        <Select value={sortOption} onValueChange={setSortOption}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created-desc">{t("sortRecent")}</SelectItem>
            <SelectItem value="created-asc">{t("sortOldest")}</SelectItem>
            <SelectItem value="role">{t("sortRole")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isMobile ? (
        <div className="grid gap-4">
          {paginatedList.map((staff) => (
            <Card key={staff.id}>
              <CardContent className="p-4 space-y-2">
                <div className="font-semibold">
                  {staff.firstName} {staff.lastName}
                </div>
                <div className="text-sm text-muted-foreground">
                  {staff.roleLabel}
                </div>
                <div className="text-sm text-muted-foreground">
                  {staff.email}
                </div>
                <div className="text-sm text-muted-foreground">
                  {staff.phone}
                </div>
                {renderBadge(staff.accepted)}
                <div className="flex gap-2 pt-2">
                  <EditStaffModal
                    staff={staff as Staff}
                    onSaveAction={(updatedStaff) =>
                      setStaffListAction((prev) =>
                        prev.map((s) =>
                          s.id === updatedStaff.id
                            ? { ...s, ...updatedStaff }
                            : s
                        )
                      )
                    }
                  />
                  <DeleteStaffButton
                    staffId={staff.id}
                    staffName={`${staff.firstName} ${staff.lastName}`}
                    onDeletedAction={(id) =>
                      setStaffListAction((prev) =>
                        prev.filter((s) => s.id !== id)
                      )
                    }
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-md border shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 dark:bg-zinc-800">
              <tr className="text-left text-gray-500 dark:text-gray-300 uppercase text-xs">
                <th className="px-4 py-3">{t("headerName")}</th>
                <th className="px-4 py-3">{t("headerRole")}</th>
                <th className="px-4 py-3">{t("headerEmail")}</th>
                <th className="px-4 py-3">{t("headerPhone")}</th>
                <th className="px-4 py-3">{t("headerStatus")}</th>
                <th className="px-4 py-3 text-center">{t("headerActions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-zinc-700">
              {paginatedList.map((staff) => (
                <tr
                  key={staff.id}
                  className="hover:bg-gray-50 dark:hover:bg-zinc-700"
                >
                  <td className="px-4 py-3 font-medium text-black dark:text-white">
                    {staff.firstName} {staff.lastName}
                  </td>
                  <td className="px-4 py-3">{staff.roleLabel}</td>
                  <td className="px-4 py-3">{staff.email}</td>
                  <td className="px-4 py-3">{staff.phone}</td>
                  <td className="px-4 py-3">{renderBadge(staff.accepted)}</td>
                  <td className="px-4 py-3 text-center flex justify-center gap-2">
                    <EditStaffModal
                      staff={staff as Staff}
                      onSaveAction={(updatedStaff) =>
                        setStaffListAction((prev) =>
                          prev.map((s) =>
                            s.id === updatedStaff.id
                              ? { ...s, ...updatedStaff }
                              : s
                          )
                        )
                      }
                    />
                    <DeleteStaffButton
                      staffId={staff.id}
                      staffName={`${staff.firstName} ${staff.lastName}`}
                      onDeletedAction={(id) =>
                        setStaffListAction((prev) =>
                          prev.filter((s) => s.id !== id)
                        )
                      }
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex justify-end pt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChangeAction={handlePageChange}
        />
      </div>
    </div>
  );
}
