export const dynamic = "force-dynamic";

import { Suspense } from "react";
import ClientWrapper from "../../../components/pre-inscription/ClientWrapper";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "Preinscription.metadata",
  });
  return { title: t("title"), description: t("description") };
}

export default async function PreinscriptionPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Preinscription" });
  return (
    <section className="min-h-screen py-12 px-4 bg-muted">
      <Suspense
        fallback={
          <div className="text-center py-10 text-gray-500">
            {t("loadingForm")}
          </div>
        }
      >
        <ClientWrapper />
      </Suspense>
    </section>
  );
}
