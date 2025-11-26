import "./globals.css";
import { Inter, Geist_Mono } from "next/font/google";
import AuthProvider from "../providers/AuthProvider";
import { Toaster } from "sonner";
// import { getServerSession } from "next-auth";
// import { authOptions } from "../lib/authOptions";
import type { Metadata } from "next";
import ConditionalFooter from "components/ConditionalFooter";
import ConditionalHeader from "components/ConditionalHeader";
import "react-phone-number-input/style.css";
// import ConditionalBanner from "components/ConditionalBanner";

const geistSans = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Form Wise app",
  description: "Form Wise app",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className="h-full bg-white">
      <body
        className={`flex min-h-screen flex-col ${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {/* <ConditionalBanner /> */}
        <ConditionalHeader />
        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>
        <Toaster position="top-center" richColors />
        <ConditionalFooter />
      </body>
    </html>
  );
}
