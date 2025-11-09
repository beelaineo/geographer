import imageUrlBuilder from "@sanity/image-url";
import type { ImageUrlBuilder } from "@sanity/image-url/lib/types/builder";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { sanityClient } from "./sanity.client";

const builder = imageUrlBuilder(sanityClient);

export function urlForImage(source: SanityImageSource | null | undefined): ImageUrlBuilder {
  if (!source) {
    throw new Error("urlForImage was called with an undefined source");
  }

  return builder.image(source);
}

export function urlForImageWithWidth(source: SanityImageSource | null | undefined, width: number) {
  return urlForImage(source).width(width).auto("format").fit("max");
}

type ImageLike = {
  asset?: {
    metadata?: {
      dimensions?: {
        width?: number | null;
        height?: number | null;
        aspectRatio?: number | null;
      } | null;
    } | null;
  } | null;
};

export function getImageDimensions(image: ImageLike | null | undefined) {
  const aspectRatio = image?.asset?.metadata?.dimensions?.aspectRatio ?? null;
  const width = image?.asset?.metadata?.dimensions?.width ?? 1600;
  const height =
    image?.asset?.metadata?.dimensions?.height ??
    (aspectRatio ? Math.round(width / aspectRatio) : 1200);

  return { width, height };
}


