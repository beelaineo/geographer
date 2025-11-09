"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { WheelGesturesPlugin } from "embla-carousel-wheel-gestures";

import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { getImageDimensions, urlForImageWithWidth } from "../lib/sanityImage";

type GalleryImage = SanityImageSource & {
  _id?: string;
  _key?: string;
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

type ProjectGalleryProps = {
  images: Array<GalleryImage | null> | null | undefined;
  className?: string;
};

export default function ProjectGallery({ images, className }: ProjectGalleryProps) {
  const validImages = (images ?? []).filter(
    (image): image is GalleryImage & { asset: NonNullable<GalleryImage["asset"]> } =>
      Boolean(image?.asset?._ref || image?.asset?._id)
  );

  const [selectedIndex, setSelectedIndex] = useState(0);
  const plugins = useMemo(() => [WheelGesturesPlugin()], []);
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", loop: false, dragFree: true }, plugins);

  const scrollTo = useCallback(
    (index: number) => {
      emblaApi?.scrollTo(index);
    },
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelectedIndex(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi]);

  const rootClassName = useMemo(
    () => ["flex flex-col gap-4", className].filter(Boolean).join(" "),
    [className]
  );

  if (!validImages.length) {
    return null;
  }

  return (
    <div className={rootClassName}>
      <div className="overflow-hidden border-b border-neutral-500 md:h-full md:border-none" ref={emblaRef}>
        <div className="flex md:h-full md:gap-12 md:pl-[40vw] md:pr-12">
          {validImages.map((image) => {
            const url = urlForImageWithWidth(image, 1600).url();
            const { width, height } = getImageDimensions(image);
            const aspectRatio = width && height ? width / height : undefined;

            return (
              <figure
                key={image._key ?? image.asset?._ref ?? image.asset?._id}
                className="min-w-0 flex-[0_0_100%] md:flex md:h-full md:max-h-[80vh] md:flex-[0_0_33vw] md:flex-col md:items-center md:justify-center"
              >
                <div
                  className="flex h-auto w-full items-center justify-center md:h-full md:w-auto md:flex-1 md:max-h-[80vh]"
                  style={aspectRatio ? { aspectRatio } : undefined}
                >
                  <Image
                    src={url}
                    alt={image.alt ?? ""}
                    width={width}
                    height={height}
                    sizes="(min-width: 768px) 70vw, 100vw"
                    className="h-auto w-full object-cover md:h-full md:w-auto md:max-h-[80vh] md:max-w-full md:object-contain md:shadow-lg"
                    priority={false}
                  />
                </div>
                {image.caption ? (
                  <figcaption className="mt-2 text-xs uppercase tracking-wide text-neutral-500">
                    {image.caption}
                  </figcaption>
                ) : null}
              </figure>
            );
          })}
        </div>
      </div>

      <div className="md:hidden flex items-center justify-center gap-2">
        {validImages.map((image, index) => (
          <button
            key={image._key ?? image.asset?._ref ?? image.asset?._id ?? index}
            type="button"
            aria-label={`Go to slide ${index + 1}`}
            onClick={() => scrollTo(index)}
            className={`h-2 w-2 rounded-full border border-neutral-500 transition-opacity ${
              selectedIndex === index ? "bg-neutral-500" : "bg-transparent opacity-40 hover:opacity-70"
            }`}
          />
        ))}
      </div>
    </div>
  );
}


