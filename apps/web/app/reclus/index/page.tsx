import type { Metadata } from "next";
import { draftMode } from "next/headers";

import PlayTitleMetaList from "../../../components/PlayTitleMetaList";
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
    tags: ["sanity:interview:list"],
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
    leadContent: formatInterviewLeadInitials(interview.contributors, interview.authorInitials),
    meta: formatReleaseDateMmYyyy(interview.release_date),
    backgroundColor: interview.backgroundColor
  }));

  return (
    <div className="mx-auto max-w-3xl px-6 pb-16 pt-24 md:px-12 md:pt-36">
      <PlayTitleMetaList
        items={rows}
        showColumnHeadings
        metaColumnHeading="Date"
        buildHref={(slug) => `/interviews/${slug}`}
      />
      {!interviews.length ? (
        <p className="text-sm text-black/60">No interviews yet.</p>
      ) : null}
    </div>
  );
}
