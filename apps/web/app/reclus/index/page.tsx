import type { Metadata } from "next";
import { draftMode } from "next/headers";

import PlayTitleMetaList from "../../../components/PlayTitleMetaList";
import { sanityTag } from "../../../lib/sanityCacheTags";
import { formatInterviewLeadInitials } from "../../../lib/formatInterviewInitials";
import { cipherInterviewLineValue } from "../../../lib/interviewLineCipher";
import { formatReleaseDateMmYyyy } from "../../../lib/formatPublishDate";
import {
  PUBLISHED_INTERVIEWS_QUERY,
  type PUBLISHED_INTERVIEWS_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";

type ReclusIndexInterviewsQueryResult = Array<
  PUBLISHED_INTERVIEWS_QUERYResult[number] & { published: boolean | null }
>;

async function loadPublishedInterviews(previewEnabled: boolean) {
  return fetchSanityQuery<ReclusIndexInterviewsQueryResult>(PUBLISHED_INTERVIEWS_QUERY, {
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

  const rows = interviews.map((interview) => {
    const isPublished = interview.published === true;
    const rowSeed = interview._id ?? interview.title ?? "interview-row";
    const title = interview.title?.trim() || "Untitled";
    const leadContent = formatInterviewLeadInitials(interview.contributors, interview.authorInitials);
    const meta = formatReleaseDateMmYyyy(interview.release_date) ?? "";

    return {
      _id: interview._id,
      isObfuscated: !isPublished,
      title: isPublished ? title : cipherInterviewLineValue(title, `${rowSeed}:title`),
      slug: interview.slug,
      href: isPublished && interview.slug?.current ? `/reclus/${interview.slug.current}` : null,
      leadContent: isPublished
        ? leadContent
        : cipherInterviewLineValue(leadContent, `${rowSeed}:leadContent`),
      meta: isPublished ? meta : cipherInterviewLineValue(meta, `${rowSeed}:meta`),
      backgroundColor: interview.backgroundColor
    };
  });

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-36 md:px-12 md:pt-[115px]">
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
