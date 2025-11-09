"use client";

import useEmblaCarousel from "embla-carousel-react";
import type { ReactNode } from "react";

import type { COLLECTION_BY_SLUG_QUERYResult } from "../types/sanity.generated";
import ReleaseCard from "./ReleaseCard";

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

type ReleaseCarouselProps = {
  releases?: (Release | null)[] | null;
  className?: string;
  trailingSlot?: ReactNode;
};

export default function ReleaseCarousel({
  releases,
  className,
  trailingSlot
}: ReleaseCarouselProps) {
  const [viewportRef] = useEmblaCarousel({
    align: "start",
    containScroll: "trimSnaps",
    dragFree: true
  });

  if (!releases?.length) {
    return null;
  }

  return (
    <div className={className}>
      <div ref={viewportRef} className="overflow-hidden">
        <div className="flex pb-4">
          {releases.map((release, index) => (
            <div
              key={release?._id ?? release?.slug?.current ?? index}
              className="min-w-[70vw] max-w-[70vw] sm:min-w-[260px] sm:max-w-[260px]"
            >
              <ReleaseCard release={release} />
            </div>
          ))}
          {trailingSlot}
        </div>
      </div>
    </div>
  );
}


