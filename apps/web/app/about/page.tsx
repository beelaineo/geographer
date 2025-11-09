import type { Metadata } from "next";
import Image from "next/image";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { draftMode } from "next/headers";
import { cache } from "react";

import { ABOUT_QUERY, type ABOUT_QUERYResult } from "../../lib/queries";
import { getClient } from "../../lib/sanity.client";
import RichText from "../../components/RichText";
import { getImageDimensions, urlForImageWithWidth } from "../../lib/sanityImage";
import { SignUpForm } from "../../components/SignUpForm";

export const revalidate = 60;

type AboutImage = {
  alt?: string | null;
  caption?: string | null;
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
} | null | undefined;

const loadAbout = cache(async (previewEnabled: boolean) => {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<ABOUT_QUERYResult>(ABOUT_QUERY);
});

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const data = await loadAbout(isEnabled);

  return {
    title: data?.seo?.title || "About",
    description: data?.seo?.description
  };
}

export default async function AboutPage() {
  const { isEnabled } = await draftMode();
  const data = await loadAbout(isEnabled);
  const richText = data?.richText as PortableTextBlock[] | null | undefined;
  const imageText = data?.imageText as PortableTextBlock[] | null | undefined;
  const image = data?.image as AboutImage;

  const imageAsset =
    image && "asset" in image
      ? (image.asset as { _ref?: string | null; _id?: string | null; url?: string | null } | null | undefined)
      : null;
  const hasImageAsset = Boolean(imageAsset?._ref || imageAsset?._id || imageAsset?.url);
  const imageWithAsset = hasImageAsset ? image : null;
  const imageUrl = imageWithAsset ? urlForImageWithWidth(imageWithAsset as SanityImageSource, 1600).url() : null;
  const imageDimensions = imageWithAsset ? getImageDimensions(imageWithAsset) : null;

  const hasAboutContent =
    Boolean(richText?.length) || Boolean(imageWithAsset) || Boolean(imageText && imageText.length);
  const imageTextExists = Boolean(imageText?.length);

  return (
    <main className="px-6 md:px-12 py-2 sm:py-8 md:py-0">
      {hasAboutContent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24 min-h-screen">
          {richText?.length ? (
            <section className="order-2 md:order-1 max-w-3xl flex flex-col justify-center">
              <RichText value={richText} className="space-y-4 text-base md:text-lg" />
            </section>
          ) : null}

          {(imageWithAsset && imageUrl && imageDimensions) || imageTextExists ? (
            <section className="order-1 md:order-2 flex flex-col justify-center items-center">
              {imageWithAsset && imageUrl && imageDimensions ? (
                <div className="w-full space-y-4 px-10 md:px-0">
                  {imageTextExists ? (
                    <div className="relative">
                      <input
                        type="checkbox"
                        id="about-image-modal"
                        className="peer sr-only"
                        aria-hidden="true"
                      />
                      <label
                        htmlFor="about-image-modal"
                        className="block cursor-zoom-in"
                        aria-label="Expand image details"
                      >
                        <div className="overflow-hidden w-full md:w-3/4 lg:w-1/2 mx-auto">
                          <Image
                            src={imageUrl}
                            alt={imageWithAsset.alt ?? "About page image"}
                            width={imageDimensions.width}
                            height={imageDimensions.height}
                            sizes="(max-width: 768px) 100vw, 55vw"
                            className="h-auto w-full object-cover"
                          />
                        </div>
                      </label>

                      <div className="pointer-events-none fixed inset-0 z-50 hidden items-center justify-center bg-white px-6 py-12 transition-opacity duration-200 peer-checked:flex peer-checked:pointer-events-auto">
                        <label
                          htmlFor="about-image-modal"
                          className="absolute inset-0 cursor-pointer"
                          aria-label="Close image details"
                        />
                        <div
                          role="dialog"
                          aria-modal="true"
                          aria-labelledby="about-image-modal-heading"
                          className="relative z-10 max-h-[90vh] w-full max-w-4xl overflow-y-auto bg-white p-12 md:p-24"
                        >
                          <div className="mb-12">
                            <RichText
                              value={imageText}
                              className="space-y-4 text-2xl"
                            />
                          </div>
                          <div className="flex items-center justify-center">
                            <label
                              htmlFor="about-image-modal"
                              className="cursor-pointer text-sm md:text-lg uppercase tracking-widest"
                            >
                              Close
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-hidden md:w-3/4 lg:w-1/2">
                      <Image
                        src={imageUrl}
                        alt={imageWithAsset.alt ?? "About page image"}
                        width={imageDimensions.width}
                        height={imageDimensions.height}
                        sizes="(max-width: 768px) 100vw, 55vw"
                        className="h-auto w-full object-cover"
                      />
                    </div>
                  )}
                  {imageWithAsset.caption ? (
                    <p className="text-sm">
                      {imageWithAsset.caption}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </section>
          ) : null}
          
          <div className="block md:hidden order-3 md:order-3">
            <SignUpForm />
          </div>

        </div>
      ) : null}
    </main>
    
  );
}

