"use client";

import AppHeaderWithSuspense from "components/AppHeaderWithSuspense";
import { ReactNode, Suspense } from "react";
import RefreshSessionAfterPayment from "../../../../components/RefreshSessionAfterPayment";
import DashboardSuccessDialog from "../../../../components/DashboardSuccessDialog";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AppHeaderWithSuspense />

      <Suspense fallback={null}>
        <RefreshSessionAfterPayment />
      </Suspense>

      <Suspense fallback={null}>
        <DashboardSuccessDialog />
      </Suspense>

      <main>{children}</main>
    </div>
  );
}
