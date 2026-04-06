import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import InterviewBody from "../../../components/InterviewBody";
import { formatPublishDateMmDdYyyy } from "../../../lib/formatPublishDate";
import {
  INTERVIEW_BY_SLUG_QUERY,
  INTERVIEW_SLUGS_QUERY,
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
    tags: [`sanity:interview:${slug}`, "sanity:interview:list"],
    preview: previewEnabled
  });
}

export async function generateStaticParams() {
  const rows = await fetchSanityQuery<INTERVIEW_SLUGS_QUERYResult>(INTERVIEW_SLUGS_QUERY, {
    tags: ["sanity:interview:list"]
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
  const data = await loadInterview(interviewSlug, isEnabled);

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

  const cover = data.cover;
  const coverUrl = cover?.asset ? urlForImageWithWidth(cover, 900).url() : null;
  const coverDims = getImageDimensions(cover ?? undefined);
  const coverDisplayW = 420;
  const coverDisplayH = Math.max(1, Math.round((coverDims.height / coverDims.width) * coverDisplayW));
  const backgroundColor = colorToCss(data.backgroundColor ?? undefined);

  return (
    <main className="grid grid-cols-1 md:grid-cols-2 relative">
      {coverUrl && cover ? (
        <div className="w-full justify-center items-center flex flex-col h-screen sticky top-0">
          <Image
            src={coverUrl}
            alt={cover.alt ?? title}
            width={coverDisplayW}
            height={coverDisplayH}
            className="h-auto max-h-[70vh] w-auto max-w-[min(100%,360px)] object-contain"
            sizes="(max-width: 768px) 100vw, 360px"
            priority
          />
        </div>
      ) : null}

      <div className={`mx-auto flex w-full flex-col items-center p-10 text-center md:p-12`} style={{ backgroundColor: backgroundColor ? backgroundColor : undefined }}>
        <h1 className="hidden mt-10 text-base font-bold uppercase leading-tight tracking-wide md:mt-12">{title}</h1>

        {/* {authorLine ? (
          <p className="mt-3 max-w-prose text-center text-sm font-bold uppercase tracking-wide text-black/80">
            {authorLine}
          </p>
        ) : null}

        {publishedLabel ? (
          <time
            className="mt-2 text-base font-bold tabular-nums tracking-wide"
            dateTime={data.release_date ?? undefined}
          >
            {publishedLabel}
          </time>
        ) : null} */}

        {body?.length ? (
          <div className="w-full text-left">
            <InterviewBody value={body} className="whitespace-pre-line space-y-5" />
          </div>
        ) : null}

      </div>
    </main>
  );
}
