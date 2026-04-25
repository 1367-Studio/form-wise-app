export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ClientWrapper from "../../../components/pre-inscription/ClientWrapper";

export default function PreinscriptionPage() {
  return (
    <section className="min-h-screen py-12 px-4 bg-muted">
      <Suspense
        fallback={
          <div className="text-center py-10 text-gray-500">
            Chargement du formulaire...
          </div>
        }
      >
        <ClientWrapper />
      </Suspense>
    </section>
  );
}
