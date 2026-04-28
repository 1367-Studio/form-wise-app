"use client";

import Logo from "@/components/Logo";
import { Link } from "@/i18n/navigation";
import { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  subtitle?: ReactNode;
  children: ReactNode;
  // Optional eyebrow above title (e.g. "Step 1 of 2")
  eyebrow?: string;
  // Optional footer content under the form card (extra links etc.)
  footer?: ReactNode;
};

export default function AuthShell({
  title,
  subtitle,
  children,
  eyebrow,
  footer,
}: AuthShellProps) {
  return (
    <div className="relative min-h-svh w-full overflow-hidden bg-[#fdf8f3]">
      {/* Subtle decorative background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 h-[28rem] w-[28rem] rounded-full bg-[#f84a00]/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -right-32 h-[32rem] w-[32rem] rounded-full bg-[#ffb37a]/20 blur-3xl"
      />

      <div className="relative grid min-h-svh lg:grid-cols-2">
        {/* Left: form column */}
        <div className="flex flex-col px-4 py-8 sm:px-8 sm:py-12 lg:px-12 lg:py-16">
          <div className="flex items-center justify-between">
            <Link href="/" aria-label="Formwise" className="inline-flex">
              <Logo size="md" />
            </Link>
          </div>

          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center py-10">
            {eyebrow && (
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[#f84a00]">
                {eyebrow}
              </p>
            )}
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-3 text-sm text-gray-600">{subtitle}</p>
            )}

            <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_32px_-12px_rgba(248,74,0,0.10)] sm:p-8">
              {children}
            </div>

            {footer && (
              <div className="mt-6 text-center text-sm text-gray-600">
                {footer}
              </div>
            )}
          </div>
        </div>

        {/* Right: brand panel (desktop only) */}
        <aside className="relative hidden overflow-hidden lg:block">
          <div className="absolute inset-0 bg-gradient-to-br from-[#f84a00] via-[#ff7a3d] to-[#ffb37a]" />
          <div
            aria-hidden
            className="absolute inset-0 opacity-30 mix-blend-overlay"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.5) 0, transparent 40%), radial-gradient(circle at 80% 70%, rgba(255,255,255,0.35) 0, transparent 45%)",
            }}
          />
          <div
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, rgba(255,255,255,0.18) 1px, transparent 1px)",
              backgroundSize: "28px 28px",
              maskImage:
                "radial-gradient(ellipse at center, black 50%, transparent 80%)",
            }}
          />

          <div className="relative flex h-full flex-col justify-between p-12 text-white">
            <Logo tone="light" size="lg" />

            <div className="max-w-md space-y-6">
              <p className="text-3xl font-semibold leading-tight">
                Une école mieux organisée.
                <br />
                Des familles mieux informées.
              </p>
              <p className="text-base text-white/85">
                Formwise centralise inscriptions, communications, présences,
                facturation et journal de classe. Tout au même endroit, simple
                pour les directions, les enseignants et les parents.
              </p>

              <ul className="space-y-3 text-sm">
                {[
                  "Tableau de bord pour chaque rôle",
                  "Notifications en temps réel",
                  "Sécurité et confidentialité par défaut",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-3">
                    <span
                      aria-hidden
                      className="mt-1 inline-flex h-5 w-5 flex-none items-center justify-center rounded-full bg-white/20 ring-1 ring-white/40"
                    >
                      <span className="h-1.5 w-1.5 rounded-full bg-white" />
                    </span>
                    <span className="text-white/90">{line}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p className="text-xs text-white/70">
              © {new Date().getFullYear()} Formwise — Tous droits réservés.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
