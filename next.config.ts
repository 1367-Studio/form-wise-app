import createNextIntlPlugin from "next-intl/plugin";
import type { NextConfig } from "next";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "form-wise-app.vercel.app",
          },
        ],
        permanent: true,
        destination: "https://www.formwise.fr/:path*",
      },
    ];
  },
  images: {
    domains: [
      "tailwindcss.com",
      "cdn.sanity.io",
      "axldybsfbwwcwjekojpw.supabase.co",
    ],
  },
  serverExternalPackages: ["@prisma/client", "prisma"],
};

export default withNextIntl(nextConfig);
