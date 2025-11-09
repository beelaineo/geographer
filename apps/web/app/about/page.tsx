import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { cache } from "react";

import { ABOUT_QUERY, type ABOUT_QUERYResult } from "../../lib/queries";
import { getClient } from "../../lib/sanity.client";

export const revalidate = 60;

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

  return (
    <main>
      <h1>{data ? "About" : "About content missing"}</h1>
      <section>
        <h2>Overview</h2>
        <pre>{JSON.stringify(data?.richText, null, 2)}</pre>
      </section>
      {data?.image ? (
        <section>
          <h2>Primary Image</h2>
          <p>{data.image.alt ?? "No alt text provided"}</p>
        </section>
      ) : null}
    </main>
  );
}

