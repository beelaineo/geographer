import "server-only";

import type { Metadata } from "next";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { getImageDimensions, urlForImageWithWidth } from "./sanityImage";

type SanityImageAsset = (SanityImageSource & {
  alt?: string | null;
  asset?: {
    _ref?: string | null;
    _id?: string | null;
    url?: string | null;
    metadata?: {
      dimensions?: {
        width?: number | null;
        height?: number | null;
        aspectRatio?: number | null;
      } | null;
    } | null;
  } | null;
}) | null | undefined;

type SanityImageWithAsset = NonNullable<SanityImageAsset> & {
  asset: NonNullable<NonNullable<SanityImageAsset>["asset"]>;
};

export type SanitySeoPayload = {
  title?: string | null;
  description?: string | null;
  image?: SanityImageAsset;
} | null | undefined;

type OpenGraphWithType = Extract<NonNullable<Metadata["openGraph"]>, { type?: unknown }>;
type OpenGraphType = NonNullable<OpenGraphWithType["type"]>;

type BuildMetadataArgs = {
  seo?: SanitySeoPayload;
  siteSeo?: SanitySeoPayload;
  title?: string | null;
  description?: string | null;
  openGraphType?: OpenGraphType;
};

function hasImageAsset(image: SanityImageAsset): image is SanityImageWithAsset {
  if (!image) {
    return false;
  }

  const asset = image.asset;

  if (!asset) {
    return false;
  }

  return Boolean(asset._ref ?? asset._id ?? asset.url);
}

export function buildMetadata({
  seo,
  siteSeo,
  title,
  description,
  openGraphType = "website"
}: BuildMetadataArgs): Metadata {
  const resolvedSeo = seo ?? null;
  const resolvedSiteSeo = siteSeo ?? null;

  const resolvedTitle =
    resolvedSeo?.title ?? title ?? resolvedSiteSeo?.title ?? "Geographer";
  const resolvedDescription =
    resolvedSeo?.description ?? description ?? resolvedSiteSeo?.description ?? undefined;

  const imageSource = resolvedSeo?.image ?? resolvedSiteSeo?.image ?? null;

  let imageUrl: string | undefined;
  let imageWidth: number | undefined;
  let imageHeight: number | undefined;
  let imageAlt: string | undefined;

  if (hasImageAsset(imageSource)) {
    imageUrl = urlForImageWithWidth(imageSource, 1200).height(630).url();
    const dimensions = getImageDimensions(imageSource);
    imageWidth = dimensions.width;
    imageHeight = dimensions.height;
    imageAlt = imageSource.alt ?? resolvedTitle ?? undefined;
  }

  const metadata: Metadata = {
    title: resolvedTitle ?? undefined,
    description: resolvedDescription,
    openGraph: {
      title: resolvedTitle ?? undefined,
      description: resolvedDescription,
      type: openGraphType,
      images: imageUrl
        ? [
            {
              url: imageUrl,
              width: imageWidth,
              height: imageHeight,
              alt: imageAlt
            }
          ]
        : undefined
    },
    twitter: {
      card: imageUrl ? "summary_large_image" : "summary",
      title: resolvedTitle ?? undefined,
      description: resolvedDescription,
      images: imageUrl ? [imageUrl] : undefined
    }
  };

  return metadata;
}

