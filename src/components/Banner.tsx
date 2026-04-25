"use client";

import { useTranslations } from "next-intl";

export default function Banner() {
  const t = useTranslations("Banner");
  return (
    <div className="flex items-center justify-center gap-x-6 bg-gray-900 px-6 py-2.5 sm:px-3.5 sm:before:flex-1">
      <p className="text-sm/6 text-white">
        <a href="#">
          <strong className="font-semibold">Formwise</strong>
          <svg
            viewBox="0 0 2 2"
            aria-hidden="true"
            className="mx-2 inline size-0.5 fill-current"
          >
            <circle r={1} cx={1} cy={1} />
          </svg>
          {t("tagline")}&nbsp;
        </a>
      </p>
      <div className="hidden sm:flex flex-1 justify-end">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 3 2" height={"20"}>
          <rect fill="#CE1126" width="3" height="2" />
          <rect fill="#fff" width="2" height="2" />
          <rect fill="#002654" width="1" height="2" />
        </svg>
      </div>
    </div>
  );
}
