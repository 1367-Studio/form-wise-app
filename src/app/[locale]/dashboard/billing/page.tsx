import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/authOptions";
import { redirect } from "next/navigation";
import BillingPlans from "../../../../components/BillingPlans";
import { Suspense } from "react";
import RefreshSessionAfterPayment from "../../../../components/RefreshSessionAfterPayment";
import DashboardSuccessDialog from "../../../../components/DashboardSuccessDialog";

export default async function BillingPage() {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <>
      <Suspense fallback={null}>
        <RefreshSessionAfterPayment />
        <DashboardSuccessDialog />
      </Suspense>

      <div className="p-6">
        <BillingPlans />
      </div>
    </>
  );
}
