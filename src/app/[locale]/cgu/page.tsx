import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cgu.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function CGUPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CGUContent />;
}

function CGUContent() {
  const t = useTranslations("Cgu");
  return (
    <main className="max-w-3xl mx-auto p-6 pt-[150px] pb-[150px]">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      <h2 className="font-semibold mb-2">{t("section1Title")}</h2>
      <p className="mb-4">{t("section1Body")}</p>

      <h2 className="font-semibold mb-2">{t("section2Title")}</h2>
      <p className="mb-4">{t("section2Body")}</p>

      <h2 className="font-semibold mb-2">{t("section3Title")}</h2>
      <p className="mb-4">{t("section3Body")}</p>

      <h2 className="font-semibold mb-2">{t("section4Title")}</h2>
      <p className="mb-4">
        {t("section4Intro")}
        <br />– {t("section4Item1")}
        <br />– {t("section4Item2")}
        <br />– {t("section4Item3")}
        <br />– {t("section4Item4")}
        <br />
        {t("section4Outro")}
      </p>

      <h2 className="font-semibold mb-2">{t("section5Title")}</h2>
      <p className="mb-4">{t("section5Body")}</p>

      <h2 className="font-semibold mb-2">{t("section6Title")}</h2>
      <p className="mb-4">
        {t.rich("section6Body", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>

      <h2 className="font-semibold mb-2">{t("section7Title")}</h2>
      <p className="mb-4">{t("section7Body")}</p>

      <h2 className="font-semibold mb-2">{t("section8Title")}</h2>
      <p className="mb-4">{t("section8Body")}</p>

      <h2 className="font-semibold mb-2">{t("section9Title")}</h2>
      <p className="mb-4">{t("section9Body")}</p>

      <h2 className="font-semibold mb-2">{t("section10Title")}</h2>
      <p className="mb-2">
        {t.rich("section10Body1", {
          strong: (chunks) => <strong>{chunks}</strong>,
        })}
      </p>
      <p className="mb-4">{t("section10Body2")}</p>
    </main>
  );
}
