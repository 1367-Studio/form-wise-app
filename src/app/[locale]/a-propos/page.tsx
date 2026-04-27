import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "AboutPage.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AboutContent />;
}

function AboutContent() {
  const t = useTranslations("AboutPage");
  const richTags = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    link: (chunks: React.ReactNode) => (
      <a href="mailto:formwisecontact@gmail.com" className="underline">
        {chunks}
      </a>
    ),
  };

  return (
    <main className="relative max-w-3xl mx-auto p-6 pt-[150px] pb-[150px]">
      <h1 className="text-3xl font-bold mb-6">{t("title")}</h1>

      <p className="mb-4">{t.rich("intro", richTags)}</p>

      <h2 className="font-semibold text-xl mt-8 mb-2">{t("missionTitle")}</h2>
      <p className="mb-4">{t("missionBody")}</p>

      <h2 className="font-semibold text-xl mt-8 mb-2">{t("techTitle")}</h2>
      <p className="mb-4">{t("techBody")}</p>

      <h2 className="font-semibold text-xl mt-8 mb-2">{t("fieldTitle")}</h2>
      <p className="mb-4">{t("fieldBody")}</p>

      <h2 className="font-semibold text-xl mt-8 mb-2">{t("frenchTitle")}</h2>
      <p className="mb-4">{t("frenchBody")}</p>

      <h2 className="font-semibold text-xl mt-8 mb-2">{t("securityTitle")}</h2>
      <p className="mb-4">{t("securityBody")}</p>

      <p className="text-sm text-gray-500 mt-12">
        {t.rich("contactNote", richTags)}
      </p>
    </main>
  );
}
