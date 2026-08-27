import "../globals.css";
import { Inter, Geist_Mono, Playfair_Display } from "next/font/google";
import localFont from "next/font/local";
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
import { Contentsquare } from "./contentsquare";
import CookieBanner from "@/components/CookieBanner";
// import TrialBanner from "@/components/TrialBanner";

/**
 * Brand typeface. Only the weights the UI actually uses are shipped
 * (400/500/600/700 + italic) — the family has 20 more we would otherwise pay
 * for on every page load.
 *
 * preload is off on purpose: five faces at ~52 KB each is 260 KB of blocking
 * <link rel="preload"> for text that mostly renders in one or two of them.
 * Without it the browser downloads only the faces a page really matches, and
 * Inter below — already preloaded by next/font/google — covers the swap.
 */
const lausanne = localFont({
  src: [
    {
      path: "../../../public/fonts/TWKLausannePan/Web/TWKLausannePan-400.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../../public/fonts/TWKLausannePan/Web/TWKLausannePan-400Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "../../../public/fonts/TWKLausannePan/Web/TWKLausannePan-500.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../../../public/fonts/TWKLausannePan/Web/TWKLausannePan-600.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../../public/fonts/TWKLausannePan/Web/TWKLausannePan-600Italic.woff2",
      weight: "600",
      style: "italic",
    },
    {
      path: "../../../public/fonts/TWKLausannePan/Web/TWKLausannePan-700.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-lausanne",
  display: "swap",
  preload: false,
});

// Kept as the fallback behind Lausanne — see --font-sans in globals.css.
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
        className={`flex min-h-screen flex-col ${lausanne.variable} ${geistSans.variable} ${geistMono.variable} ${playfair.variable} antialiased`}
      >
        <Contentsquare />
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
          <CookieBanner />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
