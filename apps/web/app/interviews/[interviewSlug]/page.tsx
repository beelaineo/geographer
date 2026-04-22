import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import InterviewPageBodyWithBgToggle from "../../../components/InterviewPageBodyWithBgToggle";
import InterviewNewsletterModal from "../../../components/InterviewNewsletterModal";
import { sanityTag } from "../../../lib/sanityCacheTags";
import { formatPublishDateMmDdYyyy } from "../../../lib/formatPublishDate";
import {
  INTERVIEW_BY_SLUG_QUERY,
  INTERVIEW_SLUGS_QUERY,
  NEWSLETTER_DOCUMENT_QUERY,
  type INTERVIEW_BY_SLUG_QUERYResult,
  type INTERVIEW_SLUGS_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";
import { getImageDimensions, urlForImageWithWidth } from "../../../lib/sanityImage";
import { colorToCss } from "../../../lib/sanityColor";

async function loadInterview(slug: string, previewEnabled: boolean) {
  return fetchSanityQuery<INTERVIEW_BY_SLUG_QUERYResult>(INTERVIEW_BY_SLUG_QUERY, {
    params: { slug },
    tags: [sanityTag.interview(slug), sanityTag.interviewList],
    preview: previewEnabled
  });
}

type NewsletterDocument = {
  title: string | null;
  text: string | null;
  popupText: string | null;
  submitButtonLabel: string | null;
} | null;

async function loadNewsletterDocument(previewEnabled: boolean) {
  return fetchSanityQuery<NewsletterDocument>(NEWSLETTER_DOCUMENT_QUERY, {
    tags: [sanityTag.newsletter],
    preview: previewEnabled
  });
}

export async function generateStaticParams() {
  const rows = await fetchSanityQuery<INTERVIEW_SLUGS_QUERYResult>(INTERVIEW_SLUGS_QUERY, {
    tags: [sanityTag.interviewList]
  });

  return (rows ?? [])
    .map((row) => row?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((interviewSlug) => ({ interviewSlug }));
}

type InterviewPageProps = {
  params: Promise<{ interviewSlug: string }>;
};

export async function generateMetadata({ params }: InterviewPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const { interviewSlug } = await params;
  const [data, siteSettings] = await Promise.all([
    loadInterview(interviewSlug, isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  if (!data) {
    return buildMetadata({
      siteSeo,
      title: "Interview"
    });
  }

  const interviewSeo = data.seo as SanitySeoPayload;

  return buildMetadata({
    seo: interviewSeo,
    siteSeo,
    title: data.seo?.title ?? data.title ?? "Interview"
  });
}

function formatAuthorLine(
  authors: Array<{ name: string | null } | null> | null | undefined
): string | null {
  const parts = (authors ?? []).map((a) => a?.name?.trim()).filter((n): n is string => Boolean(n));
  if (!parts.length) {
    return null;
  }
  return parts.join(" · ");
}

export default async function InterviewPage({ params }: InterviewPageProps) {
  const { isEnabled } = await draftMode();
  const { interviewSlug } = await params;
  const [data, newsletter] = await Promise.all([
    loadInterview(interviewSlug, isEnabled),
    loadNewsletterDocument(isEnabled)
  ]);

  if (!data) {
    notFound();
  }

  if (!isEnabled && data.published === false) {
    notFound();
  }

  const title = data.title?.trim() || "Untitled";
  const publishedLabel = formatPublishDateMmDdYyyy(data.release_date);
  const body = data.body as PortableTextBlock[] | null | undefined;
  const quote = data.quote?.trim();
  const authorLine = formatAuthorLine(data.authors);
  const newsletterTitle = newsletter?.title?.trim() || "Newsletter";
  const newsletterText =
    newsletter?.popupText?.trim() ||
    newsletter?.text?.trim() ||
    "Sign up for the most significant Geographer updates in your mailbox.";
  const newsletterSubmitLabel = newsletter?.submitButtonLabel?.trim() || "Submit";

  const cover = data.cover;
  const coverUrl = cover?.asset ? urlForImageWithWidth(cover, 1024).url() : null;
  const coverDims = getImageDimensions(cover ?? undefined);
  const coverDisplayW = 420;
  const coverDisplayH = Math.max(1, Math.round((coverDims.height / coverDims.width) * coverDisplayW));
  const backgroundColor = colorToCss(data.backgroundColor ?? undefined);

  return (
    <>
      <InterviewPageBodyWithBgToggle
        title={title}
        body={body}
        coverUrl={coverUrl}
        coverAlt={cover?.alt ?? title}
        coverDisplayW={coverDisplayW}
        coverDisplayH={coverDisplayH}
        interviewBackgroundColor={backgroundColor ?? undefined}
      />
      <InterviewNewsletterModal
        title={newsletterTitle}
        text={newsletterText}
        ctaLabel={newsletterSubmitLabel}
      />
    </>
  );
}
