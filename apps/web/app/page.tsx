import type { Metadata } from "next";
import { draftMode } from "next/headers";

import { HOMEPAGE_QUERY, type HOMEPAGE_QUERYResult } from "../lib/queries";
import AutoplayVideo from "../components/AutoplayVideo";
import { fetchSiteSettings } from "../lib/siteSettings";
import { fetchSanityQuery } from "../lib/sanity.fetch";
import { buildMetadata, type SanitySeoPayload } from "../lib/seo";

async function loadHomepage(previewEnabled: boolean) {
  return fetchSanityQuery<HOMEPAGE_QUERYResult>(HOMEPAGE_QUERY, {
    tags: ["sanity:homepage"],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const [data, siteSettings] = await Promise.all([
    loadHomepage(isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const pageSeo = data?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: pageSeo,
    siteSeo,
    title: data?.title ?? "Geographer"
  });
}

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const data = await loadHomepage(isEnabled);
  const firstVideo = data?.videos?.[0];
  const playbackId = firstVideo?.asset?.playbackId;

  return (
    <main className="px-6 md:px-12 flex flex-col justify-center items-center min-h-[100dvh]">
      {playbackId ? (
        <section className="flex justify-center items-center">
          <AutoplayVideo
            playbackId={playbackId}
            className="block w-full md:w-1/2 h-auto bg-black"
          />
        </section>
      ) : null}
    </main>
  );
}
