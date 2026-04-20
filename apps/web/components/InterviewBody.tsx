import type { ReactNode } from "react";
import type { PortableTextBlock } from "@portabletext/types";
import {
  PortableText,
  type PortableTextComponents,
  type PortableTextMarkComponentProps,
  type PortableTextTypeComponentProps
} from "@portabletext/react";
import Link from "next/link";

import PortableTextRichImage from "./PortableTextRichImage";
import { resolveProductionUrl } from "../lib/resolveProductionUrl";

type InterviewBodyProps = {
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

type InterviewEntryValue = {
  _type: "interviewEntry";
  speakerRole?: string | null;
  speakerInitials?: string | null;
  text?: PortableTextBlock[] | null;
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
      <Link href={resolvedHref} className="underline underline-offset-2 hover:opacity-70">
        {children}
      </Link>
    );
  }

  return (
    <a
      href={resolvedHref}
      target={target}
      rel={rel}
      className="underline underline-offset-2 hover:opacity-70"
    >
      {children}
    </a>
  );
}

const interviewPortableTextMarks: NonNullable<PortableTextComponents["marks"]> = {
  internalLink: ({ value, children }: PortableTextMarkComponentProps<InternalLinkValue>) => {
    const href = resolveProductionUrl(value?.reference);

    return (
      <Link href={href} className="underline underline-offset-2 hover:opacity-70">
        {children}
      </Link>
    );
  },
  link: ({ value, children }: PortableTextMarkComponentProps<ExternalLinkValue>) =>
    renderPortableLink({ href: value?.href, blank: value?.blank, children }),
  externalLink: ({ value, children }: PortableTextMarkComponentProps<ExternalLinkValue>) =>
    renderPortableLink({ href: value?.href, blank: value?.blank, children })
};

/** Portable Text for `interviewEntry.text` (studio `richText`: blocks, marks, images — not nested entries). */
const interviewEntryTextComponents: PortableTextComponents = {
  types: {
    richImage: PortableTextRichImage
  },
  block: {
    normal: ({ children }: { children?: ReactNode }) => {
      if (!hasVisibleContent(children)) {
        return <p className="whitespace-pre-line text-pretty">&nbsp;</p>;
      }

      return <p className="whitespace-pre-line text-pretty">{children}</p>;
    },
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="">{children}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="">{children}</h3>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-2 border-black pl-4 text-sm italic md:text-base text-pretty">{children}</blockquote>
    )
  },
  list: {
    bullet: ({ children }) => <ul className="ml-5 list-disc space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="ml-5 list-decimal space-y-2">{children}</ol>
  },
  marks: interviewPortableTextMarks
};

function renderInterviewEntryPortableText(value: PortableTextBlock[] | null | undefined) {
  if (!value?.length) {
    return null;
  }

  return <PortableText value={value} components={interviewEntryTextComponents} />;
}

function InterviewEntryBlock({ value }: PortableTextTypeComponentProps<InterviewEntryValue>) {
  const initials = value?.speakerInitials?.trim() || "—";
  const text = value?.text;
  const role = value?.speakerRole;

  return (
    <div className={`my-6 grid grid-cols-[minmax(0,auto)_minmax(0,1fr)] gap-x-5 gap-y-1 text-left ${role === "interviewer" ? "type-interview-question md:grid-cols-[minmax(0,40px)_minmax(0,1fr)]" : "type-interview-answer md:grid-cols-[minmax(0,96px)_minmax(0,auto)]"}`}>
      <span className="tabular-nums">{initials}</span>
      <div className="min-w-0">{renderInterviewEntryPortableText(text)}</div>
    </div>
  );
}

const components: PortableTextComponents = {
  types: {
    interviewEntry: InterviewEntryBlock,
    richImage: PortableTextRichImage
  },
  block: {
    normal: ({ children }: { children?: ReactNode }) => {
      if (!hasVisibleContent(children)) {
        return <p className="type-body-text whitespace-pre-line text-pretty">&nbsp;</p>;
      }

      return <p className="type-body-text whitespace-pre-line text-pretty">{children}</p>;
    },
    h2: ({ children }: { children?: ReactNode }) => (
      <h2 className="type-body-text whitespace-pre-line">{children}</h2>
    ),
    h3: ({ children }: { children?: ReactNode }) => (
      <h3 className="type-body-text whitespace-pre-line">{children}</h3>
    ),
    blockquote: ({ children }: { children?: ReactNode }) => (
      <blockquote className="border-l-2 border-black pl-4 italic text-pretty">{children}</blockquote>
    )
  },
  list: {
    bullet: ({ children }) => <ul className="ml-5 list-disc space-y-2">{children}</ul>,
    number: ({ children }) => <ol className="ml-5 list-decimal space-y-2">{children}</ol>
  },
  marks: interviewPortableTextMarks
};

export default function InterviewBody({ value, className }: InterviewBodyProps) {
  if (!value?.length) {
    return null;
  }

  return (
    <div className={className}>
      <PortableText value={value} components={components} />
    </div>
  );
}
