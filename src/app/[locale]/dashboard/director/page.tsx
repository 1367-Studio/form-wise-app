import DirectorDashboardContent from "../../../../components/DirectorDashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Wise app | Directeur",
  description: "Form Wise app",
};

export default function DirectorDashboardPage() {
  return <DirectorDashboardContent />;
}
