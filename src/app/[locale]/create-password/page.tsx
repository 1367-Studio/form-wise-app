import { Suspense } from "react";
import CreatePasswordClient from "../../../components/CreatePasswordClient";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "CreatePassword.metadata",
  });
  return { title: t("title"), description: t("description") };
}

export default async function CreatePasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CreatePasswordClient />
    </Suspense>
  );
}
