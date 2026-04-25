import TeacherDashboardContent from "components/TeacherDashboardContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Form Wise app | Professeur",
  description: "Form Wise app",
};

export default function ParentDashboardPage() {
  return <TeacherDashboardContent />;
}
