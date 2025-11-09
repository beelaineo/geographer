import type { ReactNode } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps
} from "@portabletext/react";
import Link from "next/link";

import { resolveProductionUrl } from "../lib/resolveProductionUrl";

type RichTextProps = {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
};

type InternalLinkValue = {
  reference?: {
    _type?: string | null;
    slug?: {
      current?: string | null;
    } | null;
  } | null;
};

type ExternalLinkValue = {
  href?: string | null;
  blank?: boolean | null;
};

const components: PortableTextComponents = {
  block: {
    normal: ({ children }: { children?: ReactNode }) => (
      <p className="text-base leading-relaxed md:text-lg">{children}</p>
    ),
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="text-lg font-semibold leading-snug md:text-xl">{children}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="text-base font-semibold leading-snug md:text-lg">{children}</h3>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-2 border-black pl-4 italic">{children}</blockquote>
    )
  },
  list: {
    bullet: ({ children }) => <ul className="ml-5 list-disc space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="ml-5 list-decimal space-y-2">{children}</ol>
  },
  marks: {
    internalLink: ({ value, children }: PortableTextMarkComponentProps<InternalLinkValue>) => {
      const href = resolveProductionUrl(value?.reference);

      return (
        <Link href={href} className="underline underline-offset-4 hover:opacity-70">
          {children}
        </Link>
      );
    },
    link: ({ value, children }: PortableTextMarkComponentProps<ExternalLinkValue>) => {
      const href = value?.href ?? "#";
      const target = href.startsWith("http") ? "_blank" : undefined;

      return (
        <a
          href={href}
          target={target}
          rel={target === "_blank" ? "noopener noreferrer" : undefined}
          className="underline underline-offset-4 hover:opacity-70"
        >
          {children}
        </a>
      );
    }
  }
};

export default function RichText({ value, className }: RichTextProps) {
  if (!value?.length) {
    return null;
  }

  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
