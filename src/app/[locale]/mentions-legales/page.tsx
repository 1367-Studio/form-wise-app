import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({
    locale,
    namespace: "MentionsLegales.metadata",
  });
  return { title: t("title"), description: t("description") };
}

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <MentionsLegalesContent />;
}

function MentionsLegalesContent() {
  const t = useTranslations("MentionsLegales");
  const richTags = {
    strong: (chunks: React.ReactNode) => <strong>{chunks}</strong>,
    br: () => <br />,
    link: (chunks: React.ReactNode) => (
      <a href="https://vercel.com" className="underline">
        {chunks}
      </a>
    ),
  };
  return (
    <main className="max-w-3xl mx-auto p-6 pt-[150px] pb-[150px]">
      <h1 className="text-2xl font-bold mb-6">{t("title")}</h1>

      <h2 className="font-semibold mb-2">{t("editorTitle")}</h2>
      <p className="mb-4">{t.rich("editorBody", richTags)}</p>

      <h2 className="font-semibold mb-2">{t("addressTitle")}</h2>
      <p className="mb-4">{t("addressBody")}</p>

      <h2 className="font-semibold mb-2">{t("directorTitle")}</h2>
      <p className="mb-4">{t("directorBody")}</p>

      <h2 className="font-semibold mb-2">{t("infoTitle")}</h2>
      <p className="mb-4">{t.rich("infoBody", richTags)}</p>

      <h2 className="font-semibold mb-2">{t("hostTitle")}</h2>
      <p className="mb-4">{t.rich("hostBody", richTags)}</p>

      <h2 className="font-semibold mb-2">{t("ipTitle")}</h2>
      <p className="mb-4">{t("ipBody")}</p>
    </main>
  );
}
