import PlayTitleMetaList, { type PlayTitleMetaRow } from "./PlayTitleMetaList";
import type { Color, Slug } from "../types/sanity.generated";

export type ClubEdenReleaseListItem = {
  _id?: string | null;
  title?: string | null;
  slug?: Slug | null;
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
  return releases.map((release) => ({
    _id: release._id,
    title: release.title,
    slug: release.slug,
    href: release.slug?.current ? `/releases/${release.slug.current}` : null,
    meta: formatSeriesNames(release.seriesTitles),
    backgroundColor: release.backgroundColor
  }));
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
