"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// --- Props Typing ---

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  labels: {
    previous: string;
    next: string;
    // Function to render the page indicator (e.g., Page 1 of 10)
    pageIndicator: (currentPage: number, totalPages: number) => string;
  };
}

/**
 * Pagination control component.
 * Displays the Previous/Next buttons and the page indicator.
 */
export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  labels,
}: PaginationControlsProps) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage >= totalPages;

  const handlePrevious = () => {
    if (!isFirstPage) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (!isLastPage) {
      onPageChange(currentPage + 1);
    }
  };

  // If there is only one page or zero items, do not display the control.
  if (totalPages <= 1 && totalItems === 0) {
    return null;
  }

  // If there are no items, even if totalPages is 1 (case totalItems = 0), still do not display it.
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="flex items-center justify-between px-2 py-4">
      {/* Page Indicator */}
      <div className="text-sm font-medium text-gray-700">
        {labels.pageIndicator(currentPage, totalPages)}
      </div>

      {/* Navigation Buttons */}
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={isFirstPage}
          title={labels.previous}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          {labels.previous}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={isLastPage}
          title={labels.next}
        >
          {labels.next}
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
