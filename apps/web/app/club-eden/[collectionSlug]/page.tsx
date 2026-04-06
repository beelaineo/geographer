import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import RichText from "../../../components/RichText";
import { sanityTag } from "../../../lib/sanityCacheTags";
import { urlForImageWithWidth } from "../../../lib/sanityImage";
import {
  CLUB_EDEN_COLLECTION_SLUGS_QUERY,
  COLLECTION_BY_SLUG_QUERY,
  type CLUB_EDEN_COLLECTION_SLUGS_QUERYResult,
  type COLLECTION_BY_SLUG_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";

type CollectionReleaseEntry = NonNullable<
  NonNullable<COLLECTION_BY_SLUG_QUERYResult>["releases"]
>[number];

function isGridRelease(
  entry: CollectionReleaseEntry | null | undefined
): entry is CollectionReleaseEntry & { _id: string } {
  if (!entry || typeof entry !== "object") {
    return false;
  }
  if (!("_id" in entry) || typeof entry._id !== "string") {
    return false;
  }
  if ("_ref" in entry && !("title" in entry)) {
    return false;
  }
  return "title" in entry;
}

async function loadCollection(slug: string, previewEnabled: boolean) {
  return fetchSanityQuery<COLLECTION_BY_SLUG_QUERYResult>(COLLECTION_BY_SLUG_QUERY, {
    params: { slug },
    tags: [sanityTag.collection(slug), sanityTag.collectionList],
    preview: previewEnabled
  });
}

export async function generateStaticParams() {
  const rows = await fetchSanityQuery<CLUB_EDEN_COLLECTION_SLUGS_QUERYResult>(CLUB_EDEN_COLLECTION_SLUGS_QUERY, {
    tags: [sanityTag.collectionList]
  });

  return (rows ?? [])
    .map((row) => row?.collectionSlug)
    .filter((slug): slug is string => Boolean(slug))
    .map((collectionSlug) => ({ collectionSlug }));
}

type ClubEdenCollectionPageProps = {
  params: Promise<{ collectionSlug: string }>;
};

export async function generateMetadata({ params }: ClubEdenCollectionPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const { collectionSlug } = await params;
  const [data, siteSettings] = await Promise.all([
    loadCollection(collectionSlug, isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  if (!data) {
    return buildMetadata({
      siteSeo,
      title: "Collection"
    });
  }

  const collectionSeo = data.seo as SanitySeoPayload;

  return buildMetadata({
    seo: collectionSeo,
    siteSeo,
    title: data.seo?.title ?? data.title ?? "Collection"
  });
}

export default async function ClubEdenCollectionPage({ params }: ClubEdenCollectionPageProps) {
  const { isEnabled } = await draftMode();
  const { collectionSlug } = await params;
  const data = await loadCollection(collectionSlug, isEnabled);

  if (!data) {
    notFound();
  }

  const isPublished = data.published !== false;
  if (!isEnabled && !isPublished) {
    notFound();
  }

  const intro = data.intro as PortableTextBlock[] | null | undefined;
  const gridReleases = (data.releases ?? []).filter(isGridRelease);
  const is1992 = collectionSlug === "1992";

  const gridListClassName = is1992
    ? "mt-2 grid list-none grid-cols-4 gap-0 p-0"
    : "mt-2 grid list-none grid-cols-2 gap-8 p-0 sm:grid-cols-2 md:grid-cols-3 md:gap-16";

  const imageSizes = is1992 ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw";

  return (
    <div
      className={[
        "mx-auto px-6 pb-16 pt-24 md:px-12 md:pt-36",
        is1992 ? "max-w-3xl" : "max-w-3xl"
      ].join(" ")}
    >
      <h1 className="mb-8 hidden text-xl font-semibold md:text-3xl">{data.title}</h1>
      {intro?.length ? (
        <div className="mx-auto mb-12 max-w-3xl space-y-4 font-serif leading-relaxed">
          <RichText value={intro} />
        </div>
      ) : null}

      {gridReleases.length ? (
        <ul className={gridListClassName}>
          {gridReleases.map((release, index) => {
            const cover = release.cover ?? release.coverAlt;
            const slug = release.slug?.current;
            const title = release.title?.trim() || "Untitled";
            const key = release._id ?? `release-${index}`;
            const imageUrl = cover?.asset ? urlForImageWithWidth(cover, 720).url() : null;
            const href = slug ? `/releases/${slug}` : null;

            const cell = (
              <div className="relative aspect-[4/5] w-full overflow-hidden bg-neutral-100">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cover?.alt ?? title}
                    fill
                    sizes={imageSizes}
                    className="object-cover transition-transform duration-300 ease-out"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-200 px-3 text-center text-xs font-bold uppercase tracking-wide text-black">
                    {title}
                  </div>
                )}
                {imageUrl ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-sm font-bold uppercase leading-snug tracking-wide text-black opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100">
                    {title}
                  </span>
                ) : null}
              </div>
            );

            return (
              <li key={key} className="min-w-0">
                {href ? (
                  <Link
                    href={href}
                    className="group block w-full focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    aria-label={title}
                  >
                    {cell}
                  </Link>
                ) : (
                  <div className="group block w-full">{cell}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
