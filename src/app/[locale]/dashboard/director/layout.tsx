"use client";

import AppHeaderWithSuspense from "components/AppHeaderWithSuspense";
import { ReactNode, Suspense } from "react";
import RefreshSessionAfterPayment from "../../../../components/RefreshSessionAfterPayment";
import DashboardSuccessDialog from "../../../../components/DashboardSuccessDialog";
import AIChatBotWidget from "../../../../components/AIChatBotWidget";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div>
      <AppHeaderWithSuspense />

      <Suspense fallback={null}>
        <RefreshSessionAfterPayment />
      </Suspense>

      <Suspense fallback={null}>
        <AIChatBotWidget />
        <DashboardSuccessDialog />
      </Suspense>

      <main>{children}</main>
    </div>
  );
}
