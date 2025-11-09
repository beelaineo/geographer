import Image from "next/image";
import Link from "next/link";

import { urlForImageWithWidth } from "../lib/sanityImage";
import type { COLLECTION_BY_SLUG_QUERYResult } from "../types/sanity.generated";

type ReleaseImage = {
  alt?: string | null;
  asset?: { _ref?: string | null; url?: string | null } | null;
};

type Release = NonNullable<
  NonNullable<COLLECTION_BY_SLUG_QUERYResult>["releases"]
>[number] & {
  cover?: ReleaseImage | null;
  coverAlt?: ReleaseImage | null;
};

type ReleaseCardProps = {
  release: Release | null | undefined;
  className?: string;
};

export default function ReleaseCard({ release, className }: ReleaseCardProps) {
  if (!release) {
    return null;
  }

  const href = release.slug?.current ? `/releases/${release.slug.current}` : undefined;
  const cover = release.cover ?? release.coverAlt;
  const alt = cover?.alt ?? release.title ?? "Release cover";
  const imageUrl = cover ? urlForImageWithWidth(cover, 668).height(835).url() : null;

  const content = (
    <article
      className={[
        "flex flex-col items-stretch gap-3",
        "text-lg",
        className
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <div className="relative overflow-hidden bg-neutral-200">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={alt}
            width={668}
            height={835}
            sizes="(max-width: 768px) 75vw, 25vw"
            className="object-contain"
            priority={false}
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-neutral-300">
            <span className="text-2xl">No cover</span>
          </div>
        )}
      </div>
      <div className="flex justify-between text-xl md:text-2xl">
        <span>{release.title ?? "Untitled release"}</span>
      </div>
    </article>
  );

  if (href) {
    return (
      <Link
        href={href}
        className="transition-transform hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
      >
        {content}
      </Link>
    );
  }

  return content;
}


