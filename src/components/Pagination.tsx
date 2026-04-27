"use client";

import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChangeAction: (page: number) => void;
};

export default function Pagination({
  currentPage,
  totalPages,
  onPageChangeAction,
}: PaginationProps) {
  const t = useTranslations("Pagination");
  return (
    <div className="flex items-center justify-between pt-4">
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChangeAction(currentPage - 1)}
          disabled={currentPage === 1}
          className="cursor-pointer"
        >
          {t("previous")}
        </Button>
        <span className="text-sm pt-1">
          {t("pageStatus", { current: currentPage, total: totalPages })}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChangeAction(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="cursor-pointer"
        >
          {t("next")}
        </Button>
      </div>
    </div>
  );
}
