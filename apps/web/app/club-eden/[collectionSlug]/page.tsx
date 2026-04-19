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
    ? "max-w-[160px] mx-auto md:max-w-none md:w-full md:flex-1 mt-2 grid list-none md:grid-cols-5 gap-8 md:gap-0 p-0"
    : "max-w-[160px] mx-auto md:max-w-none mt-2 grid list-none grid-cols-1 gap-8 p-0 md:grid-cols-3 md:gap-16";

  const imageSizes = is1992 ? "(max-width: 768px) 50vw, 25vw" : "(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw";

  return (
    <div
      className={[
        "mx-auto w-full px-6 pb-16 pt-36 md:px-3 md:pt-24",
        is1992 ? "md:max-w-3xl flex flex-col md:gap-2" : "md:max-w-3xl"
      ].join(" ")}
    >
      <h1 className="mb-8 hidden md:text-3xl">{data.title}</h1>
      {intro?.length ? (
        <div className="mx-auto flex-1 mb-12 max-w-2xl space-y-4 md:px-12">
          <RichText value={intro} className="md:max-w-2xl"/>
        </div>
      ) : null}

      {gridReleases.length ? (
        <ul className={gridListClassName}>
          {gridReleases.map((release, index) => {
            const isReleasePublished = release.published !== false;
            const cover = release.cover ?? release.coverAlt;
            const slug = release.slug?.current;
            const title = release.title?.trim() || "Untitled";
            const key = release._id ?? `release-${index}`;
            const imageUrl = cover?.asset ? urlForImageWithWidth(cover, 720).url() : null;
            const href = isReleasePublished && slug ? `/releases/${slug}` : null;

            const cell = (
              <div className="relative aspect-[4/5] w-full overflow-hidden">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cover?.alt ?? title}
                    fill
                    sizes={imageSizes}
                    className="object-cover transition-transform duration-300 ease-out"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-neutral-200 px-3 text-center type-small-text uppercase text-black">
                    {title}
                  </div>
                )}
                {isReleasePublished && imageUrl ? (
                  <span className="pointer-events-none hidden md:absolute md:inset-0 md:flex items-center justify-center bg-white p-4 text-center type-small-text uppercase text-black md:opacity-0 md:transition-opacity duration-200 ease-out md:group-hover:opacity-100 md:group-focus-within:opacity-100">
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
                    <p className="md:hidden text-center type-small-text mt-2">
                      {title}
                    </p>
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
