import AppHeaderWithSuspense from "components/AppHeaderWithSuspense";
import { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AppHeaderWithSuspense />
      <main>{children}</main>
    </div>
  );
}
