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
  release_date?: string | null;
};

type ReleaseCardProps = {
  release: Release | null | undefined;
  className?: string;
};

export default function ReleaseCard({ release, className }: ReleaseCardProps) {
  if (!release) {
    return null;
  }

  const releaseHref = release.slug?.current ? `/releases/${release.slug.current}` : undefined;
  const cover = release.cover ?? release.coverAlt;
  const alt = cover?.alt ?? release.title ?? "Release cover";
  const imageUrl = cover ? urlForImageWithWidth(cover, 668).height(835).url() : null;
  const releaseDate = release.release_date
    ? new Date(
        release.release_date.length <= 10
          ? `${release.release_date}T00:00:00Z`
          : release.release_date
      )
    : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const isFutureRelease =
    releaseDate instanceof Date && !Number.isNaN(releaseDate.valueOf())
      ? releaseDate.getTime() > today.getTime()
      : false;
  const href = isFutureRelease ? undefined : releaseHref;

  const content = (
    <article
      className={[
        "flex flex-col items-stretch gap-3",
        "text-lg",
        isFutureRelease ? "cursor-not-allowed opacity-60 grayscale" : undefined,
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
      <div className="flex flex-col gap-0 text-xl md:text-2xl pl-2 md:pl-0">
        <span className="font-medium">{release.title ?? "Untitled release"}</span>
        {releaseDate ? (
          <span className="text-sm md:text-lg">
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }).format(releaseDate)}
          </span>
        ) : null}
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


