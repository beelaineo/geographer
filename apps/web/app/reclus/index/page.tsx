import type { Metadata } from "next";
import { draftMode } from "next/headers";

import PlayTitleMetaList from "../../../components/PlayTitleMetaList";
import { sanityTag } from "../../../lib/sanityCacheTags";
import { formatInterviewLeadInitials } from "../../../lib/formatInterviewInitials";
import { formatReleaseDateMmYyyy } from "../../../lib/formatPublishDate";
import {
  PUBLISHED_INTERVIEWS_QUERY,
  type PUBLISHED_INTERVIEWS_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";

async function loadPublishedInterviews(previewEnabled: boolean) {
  return fetchSanityQuery<PUBLISHED_INTERVIEWS_QUERYResult>(PUBLISHED_INTERVIEWS_QUERY, {
    tags: [sanityTag.interviewList],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    siteSeo,
    title: "Index · Reclus"
  });
}

export default async function ReclusIndexPage() {
  const { isEnabled } = await draftMode();
  const interviews = (await loadPublishedInterviews(isEnabled)) ?? [];

  const rows = interviews.map((interview) => ({
    _id: interview._id,
    title: interview.title,
    slug: interview.slug,
    href: interview.slug?.current ? `/interviews/${interview.slug.current}` : null,
    leadContent: formatInterviewLeadInitials(interview.contributors, interview.authorInitials),
    meta: formatReleaseDateMmYyyy(interview.release_date),
    backgroundColor: interview.backgroundColor
  }));

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-32">
      <PlayTitleMetaList
        items={rows}
        showColumnHeadings
        metaColumnHeading="Date"
      />
      {!interviews.length ? (
        <p className="type-small-text text-black/60">No interviews yet.</p>
      ) : null}
    </div>
  );
}
