"use client";

import { Loader2 } from "lucide-react";

type ActionButtonProps = {
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
  icon: React.ReactNode;
  className?: string;
  loading?: boolean;
};

export function ActionButton({
  onClick,
  disabled,
  title,
  icon,
  className = "",
  loading = false,
}: ActionButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`cursor-pointer p-1 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : icon}
    </button>
  );
}
