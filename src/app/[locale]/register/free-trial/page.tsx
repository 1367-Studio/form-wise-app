import FreeTrialRegisterPage from "./FreeTrialRegisterPage";
import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "FreeTrial.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function FreeTrial({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <section style={{ height: "100vh" }}>
      <FreeTrialRegisterPage />
    </section>
  );
}
