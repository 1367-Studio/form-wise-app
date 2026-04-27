import { useLocale } from "next-intl";
import { useMemo } from "react";

const currencyByLocale: Record<string, { currency: string; intl: string }> = {
  pt: { currency: "BRL", intl: "pt-BR" },
  fr: { currency: "EUR", intl: "fr-FR" },
  en: { currency: "EUR", intl: "en-GB" },
  es: { currency: "EUR", intl: "es-ES" },
};

export function useMoneyFormatter(opts?: { maximumFractionDigits?: number }) {
  const locale = useLocale();
  const { currency, intl } =
    currencyByLocale[locale] ?? currencyByLocale.fr;
  const max = opts?.maximumFractionDigits ?? 0;
  return useMemo(
    () => (value: number) =>
      new Intl.NumberFormat(intl, {
        style: "currency",
        currency,
        maximumFractionDigits: max,
      }).format(value),
    [intl, currency, max]
  );
}
