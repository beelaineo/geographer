import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { draftMode } from "next/headers";

import {
  PUBLISHED_INTERVIEWS_QUERY,
  type PUBLISHED_INTERVIEWS_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { urlForImageWithWidth } from "../../../lib/sanityImage";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";

async function loadPublishedInterviews(previewEnabled: boolean) {
  return fetchSanityQuery<PUBLISHED_INTERVIEWS_QUERYResult>(PUBLISHED_INTERVIEWS_QUERY, {
    tags: ["sanity:interview:list"],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    siteSeo,
    title: "Gallery · Reclus"
  });
}

export default async function ReclusGalleryPage() {
  const { isEnabled } = await draftMode();
  const interviews = (await loadPublishedInterviews(isEnabled)) ?? [];

  return (
    <div className="mx-auto max-w-5xl px-6 pb-16 pt-24 md:px-12 md:pt-36">
      {interviews.length ? (
        <ul className="grid list-none grid-cols-1 gap-8 p-0 sm:grid-cols-2 md:grid-cols-3 md:gap-12">
          {interviews.map((interview, index) => {
            const slug = interview.slug?.current;
            const title = interview.title?.trim() || "Untitled";
            const key = interview._id ?? `interview-${index}`;
            const cover = interview.cover;
            const imageUrl = cover?.asset ? urlForImageWithWidth(cover, 720).url() : null;
            const href = slug ? `/interviews/${slug}` : null;
            const quote = interview.quote?.trim();

            const cell = (
              <div className="relative aspect-[5/4] w-full overflow-hidden bg-white">
                {imageUrl ? (
                  <Image
                    src={imageUrl}
                    alt={cover?.alt ?? title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 33vw"
                    className="object-contain transition-transform duration-300 ease-out"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-white px-3 text-center text-xs font-bold uppercase tracking-wide text-black">
                    {title}
                  </div>
                )}
                {quote ? (
                  <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white p-4 text-center text-base font-serif leading-snug text-black opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100 group-focus-within:opacity-100 md:text-base">
                    &ldquo;{quote}&rdquo;
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
                  </Link>
                ) : (
                  <div className="group block w-full">{cell}</div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-sm text-black/60">No interviews yet.</p>
      )}
    </div>
  );
}
