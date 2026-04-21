import type { PortableTextTypeComponentProps } from "@portabletext/react";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import Image from "next/image";

import { getImageDimensions, urlForImageWithWidth } from "../lib/sanityImage";

export type PortableTextRichImageValue = {
  _type?: string;
  alt?: string | null;
  caption?: string | null;
  asset?: {
    _id?: string;
    _ref?: string;
    url?: string | null;
    metadata?: {
      dimensions?: {
        width?: number | null;
        height?: number | null;
        aspectRatio?: number | null;
      } | null;
    } | null;
  } | null;
};

const DISPLAY_WIDTH = 1200;

export default function PortableTextRichImage({
  value
}: PortableTextTypeComponentProps<PortableTextRichImageValue>) {
  if (!value?.asset) {
    return null;
  }

  const imageSource = value as SanityImageSource;
  let imageUrl: string;
  try {
    imageUrl = urlForImageWithWidth(imageSource, DISPLAY_WIDTH).url();
  } catch {
    return null;
  }

  const { width: dimW, height: dimH } = getImageDimensions(value);
  const displayW = Math.min(dimW, DISPLAY_WIDTH);
  const displayH = Math.max(1, Math.round((dimH / dimW) * displayW));

  const alt = (value?.alt ?? "").trim() || "";

  return (
    <figure className="my-8 w-full">
      <div className="flex w-full justify-center">
        <Image
          src={imageUrl}
          alt={alt}
          width={displayW}
          height={displayH}
          className="h-auto max-h-[min(80vh,1200px)] w-auto max-w-full object-contain"
          sizes="(max-width: 768px) 100vw, 480px"
        />
      </div>
      {value?.caption?.trim() ? (
        <figcaption className="mt-3 text-center type-small-text text-black">
          {value.caption.trim()}
        </figcaption>
      ) : null}
    </figure>
  );
}
