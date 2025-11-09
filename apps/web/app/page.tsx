import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { cache } from "react";

import { HOMEPAGE_QUERY, type HOMEPAGE_QUERYResult } from "../lib/queries";
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

  return (
    <main>
      <h1>{data?.title ?? "Homepage"}</h1>
      {data?.seo?.description ? (
        <p>{data.seo.description}</p>
      ) : (
        <p>Update the homepage document in Sanity to see content here.</p>
      )}
      {data?.videos?.length ? (
        <section>
          <h2>Videos</h2>
          <ul>
            {data.videos.map((video) => (
              <li key={video?._key ?? video?._id ?? video?.asset?._ref}>
                {video?.asset?.playbackId ?? "Mux asset"}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
