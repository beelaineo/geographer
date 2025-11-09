import type { Metadata } from "next";
import Image from "next/image";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";
import type { PortableTextBlock } from "@portabletext/types";

import {
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  type PROJECT_BY_SLUG_QUERYResult,
  type PROJECT_SLUGS_QUERYResult
} from "../../../lib/queries";
import { getClient } from "../../../lib/sanity.client";
import ProjectGallery from "../../../components/ProjectGallery";
import RichText from "../../../components/RichText";
import { getImageDimensions, urlForImageWithWidth } from "../../../lib/sanityImage";

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

  const metaItems = [
    { label: "Location", value: data.location },
    { label: "Dates", value: data.dates },
    { label: "Partners", value: data.partners }
  ].filter((item) => item.value);

  const columnEntries = (data.columns ?? []).flatMap((column, index) => {
    if (!Array.isArray(column?.content) || column.content.length === 0) {
      return [];
    }

    return [
      {
        key: column._key ?? `column-${index}`,
        content: column.content as PortableTextBlock[]
      }
    ];
  });

  const additionalImages = (data.images ?? []).filter((image) => image?.asset?._ref || image?.asset?._id);
  const pressItems = (data.press ?? []).filter((press) => press?.title);

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="grid gap-12 px-6 pb-16 pt-28 md:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] md:gap-20 md:px-12 md:pb-24 md:pt-32">
        <div className="order-2 flex flex-col gap-12 md:order-1">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">Project</p>
              <h1 className="text-4xl leading-none md:text-5xl">{data.title ?? "Project"}</h1>
            </div>
            {metaItems.length ? (
              <dl className="grid gap-4 md:gap-6">
                {metaItems.map(({ label, value }) => (
                  <div key={label} className="flex flex-col gap-1 text-sm md:flex-row md:items-start md:gap-6 md:text-xs">
                    <dt className="font-medium uppercase tracking-[0.2em] text-neutral-500">{label}</dt>
                    <dd className="text-base leading-relaxed md:text-lg">{value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>

          {columnEntries.length ? (
            <div className="grid gap-8 md:grid-cols-2 md:gap-12">
              {columnEntries.map((column) => (
                <RichText
                  key={column.key}
                  value={column.content}
                  className="space-y-4"
                />
              ))}
            </div>
          ) : null}
        </div>

        <div className="order-1 md:order-2">
          <ProjectGallery images={data.gallery} />
        </div>
      </section>

      {additionalImages.length ? (
        <section className="flex flex-col gap-12 px-6 pb-24 md:px-12">
          {additionalImages.map((image) => (
            <figure key={image?._key ?? image?.asset?._ref ?? image?.asset?._id} className="flex flex-col gap-3">
              <Image
                src={urlForImageWithWidth(image, 2000).url()}
                alt={image?.alt ?? ""}
                {...getImageDimensions(image)}
                sizes="(min-width: 1024px) 70vw, 100vw"
                className="h-auto w-full bg-neutral-200 object-cover"
              />
              {image?.caption ? (
                <figcaption className="text-xs uppercase tracking-[0.2em] text-neutral-500">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </section>
      ) : null}

      {pressItems.length ? (
        <section className="px-6 pb-24 md:px-12">
          <h2 className="mb-6 text-xs uppercase tracking-[0.2em] text-neutral-500">Press</h2>
          <ul className="space-y-4 text-base md:text-lg">
            {pressItems.map((pressItem, index) => {
              const links = [
                pressItem?.externalLink
                  ? { label: "View Article", href: pressItem.externalLink }
                  : null,
                pressItem?.file?.asset?.url
                  ? { label: "Download PDF", href: pressItem.file.asset.url }
                  : null
              ].filter((link): link is { label: string; href: string } => link !== null);

              return (
                <li key={pressItem?.title ?? index} className="flex flex-col gap-2">
                  <span>{pressItem?.title}</span>
                  {links.length ? (
                    <span className="flex flex-wrap items-center gap-3 text-sm uppercase tracking-[0.2em] text-neutral-500">
                      {links.map((link) => (
                        <a key={link.href} className="underline hover:opacity-70" href={link.href}>
                          {link.label}
                        </a>
                      ))}
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}

