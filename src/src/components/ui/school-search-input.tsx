"use client";

import { Input } from "@/components/ui/input";
import React from "react";

/**
 * Props for the SchoolSearchInput component.
 *
 * @property {string} search - The current search string.
 * @property {(value: string) => void} setSearch - Callback function to update the search string.
 * @property {(page: number) => void} setPage - Callback function to reset the page number to 1.
 * @property {string} [placeholder] - Optional placeholder text for the input.
 */
interface SchoolSearchInputProps {
  search: string;
  setSearch: (value: string) => void;
  setPage: (page: number) => void;
  placeholder?: string;
}

/**
 * Reusable search input component for the school administration panel.
 * Handles updating the search value and resets pagination when the search field is cleared.
 */
export function SchoolSearchInput({
  search,
  setSearch,
  setPage,
  placeholder = "Rechercher par nom d’école, numéro ou responsable…",
}: SchoolSearchInputProps) {
  return (
    <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between space-y-4 md:space-y-0">
      <Input
        type="text"
        placeholder={placeholder}
        value={search}
        onChange={(e) => {
          // When the user deletes characters and the search becomes shorter than 3 characters,
          // and the previous search value was >= 3, reset the page to 1
          if (e.target.value.length < 3 && search.length >= 3) {
            setPage(1);
          }
          setSearch(e.target.value);
        }}
        className="max-w-sm"
      />
    </div>
  );
}
