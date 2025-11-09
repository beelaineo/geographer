import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  COLLECTION_BY_SLUG_QUERY,
  COLLECTION_SLUGS_QUERY,
  type COLLECTION_BY_SLUG_QUERYResult,
  type COLLECTION_SLUGS_QUERYResult
} from "../../../lib/queries";
import { getClient } from "../../../lib/sanity.client";

export const revalidate = 180;

const loadCollection = cache(async (slug: string, previewEnabled: boolean) => {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<COLLECTION_BY_SLUG_QUERYResult>(COLLECTION_BY_SLUG_QUERY, { slug });
});

export async function generateStaticParams() {
  const client = getClient();
  const slugs = await client.fetch<COLLECTION_SLUGS_QUERYResult>(COLLECTION_SLUGS_QUERY);

  return (slugs ?? [])
    .map((entry) => entry?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

type CollectionPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const data = await loadCollection(params.slug, isEnabled);

  if (!data) {
    return {
      title: "Collection not found"
    };
  }

  return {
    title: data.title ?? "Collection",
    description: data.location ?? data.partners ?? undefined
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { isEnabled } = await draftMode();
  const data = await loadCollection(params.slug, isEnabled);

  if (!data) {
    notFound();
  }

  return (
    <main>
      <h1>{data.title ?? "Collection"}</h1>
      <p>
        {[data.location, data.dates, data.partners].filter(Boolean).join(" • ")}
      </p>
      <section>
        <h2>Intro</h2>
        <pre>{JSON.stringify(data.intro, null, 2)}</pre>
      </section>
      {data.releases?.length ? (
        <section>
          <h2>Related Releases</h2>
          <ul>
            {data.releases.map((release, index) => {
              const slug = release?.slug?.current;
              const href = slug ? `/releases/${slug}` : "#";
              return (
                <li key={release?._id ?? slug ?? index}>
                  {slug ? <Link href={href}>{release?.title ?? "Release"}</Link> : release?.title ?? "Release"}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
      {data.press?.length ? (
        <section>
          <h2>Press</h2>
          <ul>
            {data.press.map((pressItem, index) => (
              <li key={pressItem?.title ?? index}>
                <span>{pressItem?.title}</span>
                {pressItem?.externalLink ? (
                  <span>
                    {" "}
                    — <a href={pressItem.externalLink}>External link</a>
                  </span>
                ) : null}
                {pressItem?.file?.asset?.url ? (
                  <span>
                    {" "}
                    — <a href={pressItem.file.asset.url}>Download PDF</a>
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

