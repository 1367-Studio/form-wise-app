import { getTranslations } from "next-intl/server";
import {
  PortableText,
  toPlainText,
  type PortableTextBlock,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
  type PortableTextTypeComponentProps,
} from "@portabletext/react";
import { cn } from "@/lib/utils";

type CalloutTone = "info" | "warning" | "tip";

const CALLOUT_TONE_BORDERS: Record<CalloutTone, string> = {
  info: "border-primary/60",
  warning: "border-amber-500/70",
  tip: "border-green-600/60 dark:border-green-500/60",
};

interface CalloutValue {
  _type: "callout";
  tone?: string;
  text?: string;
}

interface LinkValue {
  _type: "link";
  href?: string;
  openInNewTab?: boolean;
}

function isCalloutTone(value: unknown): value is CalloutTone {
  return value === "info" || value === "warning" || value === "tip";
}

interface LegalDocumentBodyProps {
  /** `helpBody` Portable Text of a `legalDocument`, already resolved to one locale. */
  value: PortableTextBlock[];
}

export default async function LegalDocumentBody({
  value,
}: LegalDocumentBodyProps) {
  const translations = await getTranslations("LegalDocument");
  const calloutLabels: Record<CalloutTone, string> = {
    info: translations("calloutInfo"),
    warning: translations("calloutWarning"),
    tip: translations("calloutTip"),
  };

  const components: PortableTextComponents = {
    block: {
      normal: ({ value: blockValue, children }) =>
        toPlainText(blockValue).trim() ? (
          <p className="mb-4">{children}</p>
        ) : null,
      h2: ({ children }) => <h2 className="font-semibold mb-2">{children}</h2>,
      h3: ({ children }) => <h3 className="font-medium mb-2">{children}</h3>,
      blockquote: ({ children }) => (
        <blockquote className="mb-4 border-l-2 border-border pl-4">
          {children}
        </blockquote>
      ),
    },
    list: {
      bullet: ({ value: listValue, children }) => (
        <ul className={cn("list-disc pl-6", listValue.level < 2 && "mb-4")}>
          {children}
        </ul>
      ),
      number: ({ value: listValue, children }) => (
        <ol className={cn("list-decimal pl-6", listValue.level < 2 && "mb-4")}>
          {children}
        </ol>
      ),
    },
    listItem: {
      bullet: ({ children }) => <li className="pl-1">{children}</li>,
      number: ({ children }) => <li className="pl-1">{children}</li>,
    },
    marks: {
      strong: ({ children }) => (
        <strong className="font-bold">{children}</strong>
      ),
      em: ({ children }) => <em className="italic">{children}</em>,
      code: ({ children }) => (
        <code className="font-mono text-sm">{children}</code>
      ),
      link: ({
        value: linkValue,
        children,
      }: PortableTextMarkComponentProps<LinkValue>) => {
        const href =
          typeof linkValue?.href === "string" && linkValue.href
            ? linkValue.href
            : undefined;
        if (!href) return <>{children}</>;
        const opensInNewTab = linkValue?.openInNewTab === true;
        return (
          <a
            href={href}
            className="underline underline-offset-4 break-words hover:text-primary"
            target={opensInNewTab ? "_blank" : undefined}
            rel={opensInNewTab ? "noopener noreferrer" : undefined}
          >
            {children}
          </a>
        );
      },
    },
    types: {
      callout: ({
        value: calloutValue,
      }: PortableTextTypeComponentProps<CalloutValue>) => {
        if (!calloutValue?.text?.trim()) return null;
        const tone = isCalloutTone(calloutValue.tone)
          ? calloutValue.tone
          : "info";
        return (
          <div
            className={cn("mb-4 border-l-2 pl-4", CALLOUT_TONE_BORDERS[tone])}
          >
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {calloutLabels[tone]}
            </p>
            <p className="mt-1 whitespace-pre-line">{calloutValue.text}</p>
          </div>
        );
      },
      // No Sanity image-URL pipeline on this site: a broken <img> would be worse than none.
      image: () => null,
    },
    // onMissingComponent={false} only silences the console warning: the default unknown-type
    // component still emits a hidden debug <div> into the HTML.
    unknownType: () => null,
  };

  return (
    <PortableText
      value={value}
      components={components}
      onMissingComponent={false}
    />
  );
}
