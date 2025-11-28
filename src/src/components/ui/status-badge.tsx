import { Badge } from "@/components/ui/badge";
import React from "react";

type StatusType = "PENDING" | "ACCEPTED" | "REJECTED";

interface StatusBadgeProps {
  status: StatusType;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  switch (status) {
    case "PENDING":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          En attente
        </Badge>
      );
    case "ACCEPTED":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          Acceptée
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          Rejetée
        </Badge>
      );
    default:
      return (
        <Badge className="bg-gray-400 text-white hover:bg-gray-400">N/A</Badge>
      );
  }
}
