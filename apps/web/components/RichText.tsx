import type { ReactNode } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps
} from "@portabletext/react";
import Link from "next/link";

import PortableTextRichImage from "./PortableTextRichImage";
import { resolveProductionUrl } from "../lib/resolveProductionUrl";

type RichTextProps = {
  value: PortableTextBlock[] | null | undefined;
  className?: string;
};

type InternalLinkValue = {
  _type: "internalLink";
  reference?: {
    _type?: string | null;
    slug?: {
      current?: string | null;
    } | null;
  } | null;
};

type ExternalLinkValue = {
  _type: "link";
  href?: string | null;
  blank?: boolean | null;
};

function hasVisibleContent(children: ReactNode): boolean {
  const nodes = Array.isArray(children) ? children : [children];

  for (const node of nodes) {
    if (typeof node === "string" && node.trim().length > 0) {
      return true;
    }

    if (typeof node === "number") {
      return true;
    }

    if (node && typeof node === "object" && "props" in node) {
      const childNode = (node as { props?: { children?: ReactNode } }).props?.children;
      if (hasVisibleContent(childNode)) {
        return true;
      }
    }
  }

  return false;
}

function renderPortableLink({
  href,
  blank,
  children
}: {
  href?: string | null;
  blank?: boolean | null;
  children: ReactNode;
}) {
  const resolvedHref = href ?? "#";
  const isInternal = resolvedHref.startsWith("/");
  const shouldOpenInNewTab = blank ?? (!isInternal && resolvedHref.startsWith("http"));
  const target = shouldOpenInNewTab ? "_blank" : undefined;
  const rel = shouldOpenInNewTab ? "noopener noreferrer" : undefined;

  if (isInternal) {
    return (
      <Link href={resolvedHref} className="underline underline-offset-4 hover:opacity-70">
        {children}
      </Link>
    );
  }

  return (
    <a
      href={resolvedHref}
      target={target}
      rel={rel}
      className="underline underline-offset-4 hover:opacity-70"
    >
      {children}
    </a>
  );
}

const components: PortableTextComponents = {
  types: {
    richImage: PortableTextRichImage
  },
  block: {
    normal: ({ children }: { children?: ReactNode }) => {
      if (!hasVisibleContent(children)) {
        return <p className="type-body-text whitespace-pre-line">&nbsp;</p>;
      }

      return <p className="type-body-text whitespace-pre-line">{children}</p>;
    },
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="type-body-text whitespace-pre-line">{children}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="type-body-text whitespace-pre-line">{children}</h3>
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
    strong: ({ children }: { children?: ReactNode }) => (
      <strong className="font-sans font-bold">{children}</strong>
    ),
    center: ({ children }: { children?: ReactNode }) => (
      <span className="block text-center type-body-sans">{children}</span>
    ),
    internalLink: ({ value, children }: PortableTextMarkComponentProps<InternalLinkValue>) => {
      const href = resolveProductionUrl(value?.reference);

      return (
        <Link href={href} className="underline underline-offset-4 hover:opacity-70">
          {children}
        </Link>
      );
    },
    link: ({ value, children }: PortableTextMarkComponentProps<ExternalLinkValue>) =>
      renderPortableLink({ href: value?.href, blank: value?.blank, children }),
    externalLink: ({ value, children }: PortableTextMarkComponentProps<ExternalLinkValue>) =>
      renderPortableLink({ href: value?.href, blank: value?.blank, children })
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
