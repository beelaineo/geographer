import imageUrlBuilder from "@sanity/image-url";
import { decode } from "blurhash";
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

function componentToHex(component: number) {
  const hex = component.toString(16).padStart(2, "0");
  return hex;
}

export function blurHashToDataURL(blurHash: string, width = 32, height = 32): string | null {
  try {
    const pixels = decode(blurHash, width, height);
  const svgParts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">`
  ];

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = 4 * (y * width + x);
      const r = pixels[offset];
      const g = pixels[offset + 1];
      const b = pixels[offset + 2];
      const hexColor = `#${componentToHex(r)}${componentToHex(g)}${componentToHex(b)}`;
      svgParts.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="${hexColor}" />`);
    }
  }

  svgParts.push("</svg>");

  const svg = svgParts.join("");
  const base64 = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${base64}`;
  } catch (error) {
    console.error("Failed to decode blurhash", error);
    return null;
  }
}


