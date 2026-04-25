import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Privacy.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent />;
}

function PrivacyContent() {
  const t = useTranslations("Privacy");
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;

  const list = (n: number, items: number) => (
    <ul className="list-disc list-inside ml-4 mt-2">
      {Array.from({ length: items }).map((_, i) => (
        <li key={i}>{t.rich(`section${n}Item${i + 1}`, { strong })}</li>
      ))}
    </ul>
  );

  return (
    <main className="relative max-w-3xl mx-auto p-6 pt-[150px] pb-[150px]">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <p className="mb-4">{t.rich("intro", { strong })}</p>

      <h2 className="font-semibold mb-2">{t("section1Title")}</h2>
      <p className="mb-4">{t.rich("section1Body", { strong })}</p>

      <h2 className="font-semibold mb-2">{t("section2Title")}</h2>
      <div className="mb-4">
        <p>{t("section2Intro")}</p>
        {list(2, 6)}
      </div>

      <h2 className="font-semibold mb-2">{t("section3Title")}</h2>
      <div className="mb-4">
        <p>{t("section3Intro")}</p>
        {list(3, 5)}
      </div>

      <h2 className="font-semibold mb-2">{t("section4Title")}</h2>
      <p className="mb-4">{t("section4Body")}</p>

      <h2 className="font-semibold mb-2">{t("section5Title")}</h2>
      <p className="mb-4">{t("section5Body")}</p>

      <h2 className="font-semibold mb-2">{t("section6Title")}</h2>
      <div className="mb-4">
        <p>{t("section6Intro")}</p>
        {list(6, 5)}
        <p className="mt-4">{t.rich("section6Outro", { strong })}</p>
      </div>

      <h2 className="font-semibold mb-2">{t("section7Title")}</h2>
      <p className="mb-4">{t("section7Body")}</p>

      <h2 className="font-semibold mb-2">{t("section8Title")}</h2>
      <div className="mb-4">
        <p>{t("section8Intro")}</p>
        {list(8, 3)}
        <p className="mt-4">{t("section8Outro")}</p>
      </div>

      <h2 className="font-semibold mb-2">{t("section9Title")}</h2>
      <p className="mb-4">{t("section9Body")}</p>

      <h2 className="font-semibold mb-2">{t("section10Title")}</h2>
      <p className="mb-4">{t("section10Body")}</p>

      <h2 className="font-semibold mb-2">{t("section11Title")}</h2>
      <p className="mb-4">{t.rich("section11Body", { strong })}</p>
    </main>
  );
}
