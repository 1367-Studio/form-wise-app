import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Cgs.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function CGSPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CGSContent />;
}

function CGSContent() {
  const t = useTranslations("Cgs");
  const strong = (chunks: React.ReactNode) => <strong>{chunks}</strong>;
  return (
    <main className="max-w-3xl mx-auto p-6 pt-[150px] pb-[150px]">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>
      <p className="mb-4">{t.rich("intro", { strong })}</p>

      {[1, 2, 3, 4, 5, 6, 7].map((n) => (
        <section key={n}>
          <h2 className="font-semibold mb-2">{t(`section${n}Title`)}</h2>
          <p className="mb-4">{t.rich(`section${n}Body`, { strong })}</p>
        </section>
      ))}
    </main>
  );
}
