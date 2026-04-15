import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import RichText from "../../../components/RichText";
import { sanityTag } from "../../../lib/sanityCacheTags";
import { formatPublishDateMmDdYyyy } from "../../../lib/formatPublishDate";
import {
  RELEASE_BY_SLUG_QUERY,
  RELEASE_SLUGS_QUERY,
  type RELEASE_BY_SLUG_QUERYResult,
  type RELEASE_SLUGS_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";
import { getImageDimensions, urlForImageWithWidth } from "../../../lib/sanityImage";

async function loadRelease(slug: string, previewEnabled: boolean) {
  return fetchSanityQuery<RELEASE_BY_SLUG_QUERYResult>(RELEASE_BY_SLUG_QUERY, {
    params: { slug },
    tags: [sanityTag.release(slug), sanityTag.releaseList],
    preview: previewEnabled
  });
}

export async function generateStaticParams() {
  const rows = await fetchSanityQuery<RELEASE_SLUGS_QUERYResult>(RELEASE_SLUGS_QUERY, {
    tags: [sanityTag.releaseList]
  });

  return (rows ?? [])
    .map((row) => row?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((releaseSlug) => ({ releaseSlug }));
}

type ReleasePageProps = {
  params: Promise<{ releaseSlug: string }>;
};

export async function generateMetadata({ params }: ReleasePageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const { releaseSlug } = await params;
  const [data, siteSettings] = await Promise.all([
    loadRelease(releaseSlug, isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  if (!data) {
    return buildMetadata({
      siteSeo,
      title: "Release"
    });
  }

  const releaseSeo = data.seo as SanitySeoPayload;

  return buildMetadata({
    seo: releaseSeo,
    siteSeo,
    title: data.seo?.title ?? data.title ?? "Release"
  });
}

export default async function ReleasePage({ params }: ReleasePageProps) {
  const { isEnabled } = await draftMode();
  const { releaseSlug } = await params;
  const data = await loadRelease(releaseSlug, isEnabled);

  if (!data) {
    notFound();
  }

  if (!isEnabled && data.published === false) {
    notFound();
  }

  const title = data.title?.trim() || "Untitled";
  const publishedLabel = formatPublishDateMmDdYyyy(data.release_date);
  const intro = data.intro as PortableTextBlock[] | null | undefined;

  const cover = data.cover;
  const coverAlt = data.coverAlt;
  const coverUrl = cover?.asset ? urlForImageWithWidth(cover, 900).url() : null;
  const coverAltUrl = coverAlt?.asset ? urlForImageWithWidth(coverAlt, 900).url() : null;
  const coverDims = getImageDimensions(cover ?? undefined);
  const coverAltDims = getImageDimensions(coverAlt ?? undefined);
  const coverDisplayW = 420;
  const coverDisplayH = Math.max(1, Math.round((coverDims.height / coverDims.width) * coverDisplayW));
  const coverAltDisplayH = Math.max(
    1,
    Math.round((coverAltDims.height / coverAltDims.width) * coverDisplayW)
  );
  const dualCoverClassName = "h-auto max-h-[33vh] w-auto max-w-[min(50%,160px)] object-contain";
  const singleCoverClassName = "h-auto max-h-[33vh] w-auto max-w-[min(100%,180px)] object-contain";
  const dualCoverSizes = "(max-width: 768px) 50vw, 360px";
  const singleCoverSizes = "(max-width: 768px) 100vw, 360px";

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-col items-center px-6 pb-20 pt-24 text-center md:px-12 md:pt-36">
      {(coverUrl || coverAltUrl) && (
        <div className="flex w-full flex-row items-center justify-center">
          {coverUrl && cover ? (
            <Image
              src={coverUrl}
              alt={cover.alt ?? title}
              width={coverDisplayW}
              height={coverDisplayH}
              className={coverAltUrl ? dualCoverClassName : singleCoverClassName}
              sizes={coverAltUrl ? dualCoverSizes : singleCoverSizes}
              priority
            />
          ) : null}
          {coverAltUrl && coverAlt ? (
            <Image
              src={coverAltUrl}
              alt={coverAlt.alt ?? `${title} alternate cover`}
              width={coverDisplayW}
              height={coverAltDisplayH}
              className={dualCoverClassName}
              sizes={dualCoverSizes}
            />
          ) : null}
        </div>
      )}

      <h1 className="mt-10 md:mt-12 uppercase type-body-sans">{title}</h1>

      {publishedLabel ? (
        <time
          className="mt-2 type-body-sans tabular-nums"
          dateTime={data.release_date ?? undefined}
        >
          {publishedLabel}
        </time>
      ) : null}

      {intro?.length ? (
        <div className="mt-6 w-full text-center type-body-text">
          <RichText
            value={intro}
            className="[&_blockquote]:mx-auto [&_blockquote]:max-w-prose [&_blockquote]:border-l-0 [&_blockquote]:pl-0 [&_blockquote]:text-center [&_h2]:text-center [&_h3]:text-center [&_li]:text-left [&_ol]:mx-auto [&_ol]:inline-block [&_ol]:text-left [&_p]:text-center [&_ul]:mx-auto [&_ul]:inline-block [&_ul]:text-left"
          />
        </div>
      ) : null}

      {data.embed ? (
        <div className="mt-12 flex max-w-[75%] w-full justify-center bg-white p-4">
          <div
            className="release-embed w-full max-w-full overflow-x-auto [&_iframe]:mx-auto [&_iframe]:max-w-full"
            dangerouslySetInnerHTML={{ __html: data.embed }}
          />
        </div>
      ) : null}
    </main>
  );
}
