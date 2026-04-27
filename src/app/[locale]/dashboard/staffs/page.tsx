import StaffDashboardContent from "components/StaffDashboardContent";
export const dynamic = "force-dynamic";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Wise app | Parent",
  description: "Form Wise app",
};

export default function StaffDashboardPage() {
  return <StaffDashboardContent />;
}
