"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import Link from "next/link";

import { colorToCss } from "../lib/sanityColor";
import type { Color, Slug } from "../types/sanity.generated";

export type PlayTitleMetaRow = {
  _id?: string | null;
  title?: string | null;
  slug?: Slug | null;
  href?: string | null;
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
};

type SortColumn = "title" | "meta";
type SortDirection = "asc" | "desc";

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
  metaColumnHeading
}: PlayTitleMetaListProps) {
  const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  if (!items.length) {
    return null;
  }

  const sortedItems = useMemo(() => {
    if (!sortColumn) {
      return items;
    }

    const dir = sortDirection === "asc" ? 1 : -1;
    const getValue = (row: PlayTitleMetaRow) => {
      if (sortColumn === "title") {
        return row.title?.trim() || "Untitled";
      }
      return row.meta?.trim() || "";
    };

    return items
      .map((row, index) => ({ row, index }))
      .sort((a, b) => {
        const aValue = getValue(a.row);
        const bValue = getValue(b.row);
        const cmp = aValue.localeCompare(bValue, undefined, { sensitivity: "base" });

        if (cmp !== 0) {
          return cmp * dir;
        }

        return a.index - b.index;
      })
      .map(({ row }) => row);
  }, [items, sortColumn, sortDirection]);

  const onHeadingClick = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      return;
    }

    setSortColumn(column);
    setSortDirection("asc");
  };

  const clearSort = () => {
    setSortColumn(null);
    setSortDirection("asc");
  };

  const sortLabel = (column: SortColumn) => {
    if (sortColumn !== column) {
      return "";
    }
    return sortDirection === "asc" ? " ↑" : " ↓";
  };

  const sortDirectionLabel = (column: SortColumn) => {
    if (sortColumn !== column) {
      return "";
    }
    return sortDirection === "asc" ? " ascending" : " descending";
  };

  const normalizedMetaHeading = metaColumnHeading.trim().toLowerCase();
  const thirdColumnWidth = normalizedMetaHeading === "date" ? "60px" : "64px";
  const hasAnyLeadDisplay = sortedItems.some((row) => row.leadContent !== undefined);
  const headerFirstColumnWidth = hasAnyLeadDisplay ? "24px" : "8px";
  const headerGridTemplateColumns = `${headerFirstColumnWidth} minmax(0, 1fr) ${thirdColumnWidth}`;

  return (
    <div className="w-full max-w-2xl">
      {showColumnHeadings ? (
        <div
          className="grid w-full items-end gap-x-5 pb-2 px-2 md:px-5 type-small-text uppercase"
          style={{ gridTemplateColumns: headerGridTemplateColumns }}
        >
          <span style={{ width: headerFirstColumnWidth }} aria-hidden />
          <span className="pl-[calc(2.5rem+8px)] flex items-center justify-center gap-1">
            <button
              type="button"
              className="uppercase text-center leading-none underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => onHeadingClick("title")}
              aria-label={`Sort by name${sortDirectionLabel("title")}`}
            >
              Name{sortLabel("title")}
            </button>
            {sortColumn === "title" ? (
              <button
                type="button"
                className="font-normal leading-none hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={clearSort}
                aria-label="Clear name sort"
              >
                x
              </button>
            ) : null}
          </span>
          <span className="flex items-center justify-center gap-1">
            <button
              type="button"
              className="uppercase text-center leading-none underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              onClick={() => onHeadingClick("meta")}
              aria-label={`Sort by ${metaColumnHeading}${sortDirectionLabel("meta")}`}
            >
              {metaColumnHeading}
              {sortLabel("meta")}
            </button>
            {sortColumn === "meta" ? (
              <button
                type="button"
                className="leading-none hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                onClick={clearSort}
                aria-label={`Clear ${metaColumnHeading} sort`}
              >
                x
              </button>
            ) : null}
          </span>
        </div>
      ) : null}
      <ul className="w-full list-none border-t border-black p-0">
        {sortedItems.map((row, index) => {
          const title = row.title?.trim() || "Untitled";
          const key = row._id ?? `row-${index}`;
          const metaTrimmed = row.meta?.trim();
          const metaDisplay = metaTrimmed ? metaTrimmed : "—";
          const href = row.href ?? null;
          const hoverBg = colorToCss(row.backgroundColor ?? undefined);
          const leadDefined = row.leadContent !== undefined;
          const leadTrimmed = row.leadContent?.trim();
          const leadDisplay = leadDefined ? (leadTrimmed ? leadTrimmed : "—") : null;
          const rowFirstColumnWidth = leadDisplay === null ? "8px" : "24px";
          const rowGridTemplateColumns = `${rowFirstColumnWidth} minmax(0, 1fr) ${thirdColumnWidth}`;

          const rowClassName =
            "grid w-full items-center gap-x-5 border-b border-black px-2 md:px-5 py-2 text-inherit transition-colors duration-200 ease-out";

          const rowTextClassName = "type-small-text text-center uppercase tabular-nums";

          const inner = (
            <>
              <span
                className="flex items-center justify-center text-center leading-none"
                style={{ width: rowFirstColumnWidth }}
                aria-hidden={!leadDefined}
              >
                {leadDisplay !== null ? (
                  <span className={rowTextClassName}>{leadDisplay}</span>
                ) : (
                  <PlayTriangleIcon className="h-2 w-2" />
                )}
              </span>
              <span className={["pl-[calc(2.5rem+8px)]", rowTextClassName].filter(Boolean).join(" ")}>
                {title}
              </span>
              <span className={rowTextClassName}>
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
                    ({
                      gridTemplateColumns: rowGridTemplateColumns,
                      ...(hoverBg ? { ["--ce-row-hover" as string]: hoverBg } : {})
                    } as CSSProperties)
                  }
                >
                  {inner}
                </Link>
              ) : (
                <div
                  className={rowClassName}
                  style={{ gridTemplateColumns: rowGridTemplateColumns }}
                >
                  {inner}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
