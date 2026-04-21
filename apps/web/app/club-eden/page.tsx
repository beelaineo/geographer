import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import { draftMode } from "next/headers";

import ClubEdenReleaseList from "../../components/ClubEdenReleaseList";
import { sanityTag } from "../../lib/sanityCacheTags";
import RichText from "../../components/RichText";
import {
  CLUB_EDEN_DOCUMENT_QUERY,
  CLUB_EDEN_RELEASES_QUERY,
  type CLUB_EDEN_DOCUMENT_QUERYResult,
  type CLUB_EDEN_RELEASES_QUERYResult
} from "../../lib/queries";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

type ClubEdenReleasesQueryResult = Array<
  CLUB_EDEN_RELEASES_QUERYResult[number] & { published: boolean | null }
>;

async function loadClubEdenDocument(previewEnabled: boolean) {
  return fetchSanityQuery<CLUB_EDEN_DOCUMENT_QUERYResult>(CLUB_EDEN_DOCUMENT_QUERY, {
    tags: [sanityTag.clubEden],
    preview: previewEnabled
  });
}

async function loadReleases(previewEnabled: boolean) {
  return fetchSanityQuery<ClubEdenReleasesQueryResult>(CLUB_EDEN_RELEASES_QUERY, {
    tags: [sanityTag.releaseList, sanityTag.collectionList],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const [pageDoc, siteSettings] = await Promise.all([
    loadClubEdenDocument(isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const pageSeo = pageDoc?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: pageSeo,
    siteSeo,
    title: pageDoc?.seo?.title ?? pageDoc?.title ?? "Club Eden"
  });
}

export default async function ClubEdenPage() {
  const { isEnabled } = await draftMode();
  const [pageDoc, releases] = await Promise.all([
    loadClubEdenDocument(isEnabled),
    loadReleases(isEnabled)
  ]);
  const list = (releases ?? []).filter(Boolean);
  const intro = pageDoc?.intro as PortableTextBlock[] | null | undefined;
  const heading = pageDoc?.title?.trim() || "Club Eden";

  return (
    <div className="mx-auto w-full max-w-2xl px-6 pb-16 pt-36 md:px-12 md:pt-[115px]">
      <h1 className="mb-10 text-2xl font-semibold md:text-3xl hidden">{heading}</h1>
      {intro?.length ? (
        <div className="mb-12 max-w-2xl space-y-4 type-body-text">
          <RichText value={intro} />
        </div>
      ) : null}
      {list.length ? (
        <ClubEdenReleaseList releases={list} showColumnHeadings />
      ) : (
        <p className="type-small-text text-black">No releases yet.</p>
      )}
    </div>
  );
}
