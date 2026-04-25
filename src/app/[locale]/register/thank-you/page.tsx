import { CheckCircle } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "ThankYou.metadata" });
  return { title: t("title"), description: t("description") };
}

export default async function ThankYouPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ThankYouContent />;
}

function ThankYouContent() {
  const t = useTranslations("ThankYou");
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-white px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <CheckCircle className="mx-auto text-green-500 h-16 w-16 mb-4" />
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{t("title")}</h1>
        <p className="text-gray-600 mb-6">{t("body")}</p>
        <Link
          href="/login"
          className="inline-block bg-blue-900 hover:bg-blue-800 text-white font-medium py-2 px-4 rounded-md"
        >
          {t("signinButton")}
        </Link>
      </div>
    </div>
  );
}
