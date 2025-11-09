import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  type PROJECT_BY_SLUG_QUERYResult,
  type PROJECT_SLUGS_QUERYResult
} from "../../../lib/queries";
import { getClient } from "../../../lib/sanity.client";

export const revalidate = 180;

const loadProject = cache(async (slug: string, previewEnabled: boolean) => {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<PROJECT_BY_SLUG_QUERYResult>(PROJECT_BY_SLUG_QUERY, { slug });
});

export async function generateStaticParams() {
  const client = getClient();
  const slugs = await client.fetch<PROJECT_SLUGS_QUERYResult>(PROJECT_SLUGS_QUERY);

  return (slugs ?? [])
    .map((entry) => entry?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

type ProjectPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const data = await loadProject(params.slug, isEnabled);

  if (!data) {
    return {
      title: "Project not found"
    };
  }

  return {
    title: data.title ?? "Project",
    description: data.location ?? data.partners ?? undefined
  };
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { isEnabled } = await draftMode();
  const data = await loadProject(params.slug, isEnabled);

  if (!data) {
    notFound();
  }

  return (
    <main>
      <h1>{data.title ?? "Project"}</h1>
      <p>
        {[data.location, data.dates, data.partners].filter(Boolean).join(" • ")}
      </p>
      {data.columns?.length ? (
        <section>
          <h2>Columns</h2>
          <div style={{ display: "grid", gap: "1rem", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
            {data.columns.map((column, index) => (
              <pre key={column?._key ?? index}>{JSON.stringify(column, null, 2)}</pre>
            ))}
          </div>
        </section>
      ) : null}
      {data.gallery?.length ? (
        <section>
          <h2>Gallery</h2>
          <ul>
            {data.gallery.map((image, index) => (
              <li key={image?._key ?? image?._id ?? index}>{image?.alt ?? "Gallery image"}</li>
            ))}
          </ul>
        </section>
      ) : null}
      {data.images?.length ? (
        <section>
          <h2>Additional Images</h2>
          <ul>
            {data.images.map((image, index) => (
              <li key={image?._key ?? image?._id ?? index}>{image?.alt ?? "Project image"}</li>
            ))}
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
      <p>
        <Link href="/projects">Back to projects</Link>
      </p>
    </main>
  );
}

