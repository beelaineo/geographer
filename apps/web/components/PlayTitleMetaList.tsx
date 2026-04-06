import type { CSSProperties } from "react";
import Link from "next/link";

import { colorToCss } from "../lib/sanityColor";
import type { Color, Slug } from "../types/sanity.generated";

export type PlayTitleMetaRow = {
  _id?: string | null;
  title?: string | null;
  slug?: Slug | null;
  /**
   * First column: when `undefined`, the play triangle is shown (Club Eden).
   * When set (including empty after trim), text is shown or an em dash if blank.
   */
  leadContent?: string | null;
  /** Third column text; empty string or null shows an em dash */
  meta?: string | null;
  backgroundColor?: Color | null;
};

type PlayTitleMetaListProps = {
  items: PlayTitleMetaRow[];
  showColumnHeadings?: boolean;
  metaColumnHeading: string;
  buildHref: (slug: string) => string;
};

function PlayTriangleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 10 12"
      width={10}
      height={12}
      className={["shrink-0", className].filter(Boolean).join(" ")}
      aria-hidden
    >
      <polygon points="0,0 10,6 0,12" fill="black" />
    </svg>
  );
}

export default function PlayTitleMetaList({
  items,
  showColumnHeadings = true,
  metaColumnHeading,
  buildHref
}: PlayTitleMetaListProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="w-full max-w-5xl">
      {showColumnHeadings ? (
        <div className="grid w-full grid-cols-[64px_minmax(0,2fr)_minmax(0,1fr)] items-end gap-x-4 pb-4 text-[10px] font-bold uppercase tracking-wide md:gap-x-8">
          <span className="px-4" aria-hidden />
          <span className="text-center leading-none">Name</span>
          <span className="text-center leading-none">{metaColumnHeading}</span>
        </div>
      ) : null}
      <ul className="w-full list-none border-t border-black p-0">
        {items.map((row, index) => {
          const slug = row.slug?.current;
          const title = row.title?.trim() || "Untitled";
          const key = row._id ?? `row-${index}`;
          const metaTrimmed = row.meta?.trim();
          const metaDisplay = metaTrimmed ? metaTrimmed : "—";
          const href = slug ? buildHref(slug) : null;
          const hoverBg = colorToCss(row.backgroundColor ?? undefined);
          const leadDefined = row.leadContent !== undefined;
          const leadTrimmed = row.leadContent?.trim();
          const leadDisplay = leadDefined ? (leadTrimmed ? leadTrimmed : "—") : null;

          const rowClassName =
            "grid w-full grid-cols-[64px_minmax(0,2fr)_minmax(0,1fr)] items-center gap-x-4 border-b border-black py-2 pt-3 text-inherit transition-colors duration-200 ease-out md:gap-x-8 md:py-2 md:pt-3";

          const inner = (
            <>
              <span
                className="flex min-w-[2.5rem] items-center justify-center px-2 text-center leading-none md:min-w-[3rem] md:px-4"
                aria-hidden={!leadDefined}
              >
                {leadDisplay !== null ? (
                  <span className="text-xs font-bold uppercase tabular-nums tracking-wide leading-none">{leadDisplay}</span>
                ) : (
                  <PlayTriangleIcon className="h-2 w-2" />
                )}
              </span>
              <span className="min-w-0 text-center text-xs font-bold uppercase tracking-wide leading-none">
                {title}
              </span>
              <span className="min-w-0 text-center text-xs font-bold uppercase tracking-wide leading-none">
                {metaDisplay}
              </span>
            </>
          );

          return (
            <li key={key} className="m-0 p-0">
              {href ? (
                <Link
                  href={href}
                  className={[
                    rowClassName,
                    "no-underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
                    hoverBg ? "hover:text-[var(--ce-row-hover)]" : ""
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={
                    hoverBg
                      ? ({ ["--ce-row-hover" as string]: hoverBg } as CSSProperties)
                      : undefined
                  }
                >
                  {inner}
                </Link>
              ) : (
                <div className={rowClassName}>{inner}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
