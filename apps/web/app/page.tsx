import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { cache } from "react";

import { HOMEPAGE_QUERY, type HOMEPAGE_QUERYResult } from "../lib/queries";
import AutoplayVideo from "../components/AutoplayVideo";
import { getClient } from "../lib/sanity.client";

export const revalidate = 60;

const loadHomepage = cache(async (previewEnabled: boolean) => {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<HOMEPAGE_QUERYResult>(HOMEPAGE_QUERY);
});

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const data = await loadHomepage(isEnabled);

  return {
    title: data?.seo?.title || data?.title || "Geographer",
    description: data?.seo?.description
  };
}

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const data = await loadHomepage(isEnabled);
  const firstVideo = data?.videos?.[0];
  const playbackId = firstVideo?.asset?.playbackId;

  return (
    <main className="px-6 md:px-12 flex flex-col justify-center items-center min-h-screen">
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
