import "../globals.css";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import AuthProvider from "../../providers/AuthProvider";
import { Toaster } from "sonner";
import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import {
  getMessages,
  getTranslations,
  setRequestLocale,
} from "next-intl/server";
import { notFound } from "next/navigation";
import ConditionalFooter from "components/ConditionalFooter";
import ConditionalHeader from "components/ConditionalHeader";
import { PWAInit } from "components/PWAInit";
import { IOSInstallBanner } from "components/IOSInstallBanner";
import { routing } from "../../i18n/routing";
import { SITE_URL } from "../../lib/seo";
// import TrialBanner from "@/components/TrialBanner";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  display: "swap",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Metadata" });
  return {
    // Lets every page below express canonical/hreflang as a relative path.
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    manifest: "/manifest.json",
    themeColor: "#003EA3",
    openGraph: {
      type: "website",
      siteName: "Formwise",
      locale,
      title: t("title"),
      description: t("description"),
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og-image.png"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      // Renders <meta name="apple-mobile-web-app-title" content="Formwise" />
      title: "Formwise",
    },
    // Icons come from the app-folder file conventions:
    // favicon.ico, icon0.svg, icon1.png, apple-icon.png
  };
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full bg-white">
      <body
        className={`flex min-h-screen flex-col ${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <PWAInit />
          <IOSInstallBanner />
          <ConditionalHeader />
          {/* <TrialBanner /> */}
          <AuthProvider>
            <main className="flex-1">{children}</main>
          </AuthProvider>
          <Toaster position="top-center" richColors />
          <ConditionalFooter />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
