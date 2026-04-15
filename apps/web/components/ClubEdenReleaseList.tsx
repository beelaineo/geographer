import PlayTitleMetaList, { type PlayTitleMetaRow } from "./PlayTitleMetaList";
import { cipherInterviewLineValue } from "../lib/interviewLineCipher";
import type { Color, Slug } from "../types/sanity.generated";

export type ClubEdenReleaseListItem = {
  _id?: string | null;
  title?: string | null;
  slug?: Slug | null;
  published?: boolean | null;
  seriesTitles?: Array<string | null> | null;
  backgroundColor?: Color | null;
};

type ClubEdenReleaseListProps = {
  releases: ClubEdenReleaseListItem[];
  showColumnHeadings?: boolean;
};

function formatSeriesNames(titles: Array<string | null> | null | undefined): string | null {
  const parts = (titles ?? []).map((t) => t?.trim()).filter((t): t is string => Boolean(t));
  if (!parts.length) {
    return null;
  }
  return parts.join(" · ");
}

function toRows(releases: ClubEdenReleaseListItem[]): PlayTitleMetaRow[] {
  return releases.map((release) => {
    const isPublished = release.published === true;
    const title = release.title?.trim() || "Untitled";
    const meta = formatSeriesNames(release.seriesTitles) ?? "";
    const rowSeed = release._id ?? title;

    return {
      _id: release._id,
      isObfuscated: !isPublished,
      title: isPublished ? title : cipherInterviewLineValue(title, `${rowSeed}:title`),
      slug: release.slug,
      href: isPublished && release.slug?.current ? `/releases/${release.slug.current}` : null,
      meta: isPublished ? meta : cipherInterviewLineValue(meta, `${rowSeed}:meta`),
      backgroundColor: release.backgroundColor
    };
  });
}

export default function ClubEdenReleaseList({
  releases,
  showColumnHeadings = true
}: ClubEdenReleaseListProps) {
  return (
    <PlayTitleMetaList
      items={toRows(releases)}
      showColumnHeadings={showColumnHeadings}
      metaColumnHeading="Series"
    />
  );
}
