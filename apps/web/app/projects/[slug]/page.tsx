import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

import {
  PROJECT_BY_SLUG_QUERY,
  PROJECT_SLUGS_QUERY,
  type PROJECT_BY_SLUG_QUERYResult,
  type PROJECT_SLUGS_QUERYResult
} from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import ProjectGallery from "../../../components/ProjectGallery";
import RichText from "../../../components/RichText";
import { getImageDimensions, urlForImageWithWidth } from "../../../lib/sanityImage";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";

async function loadProject(slug: string, previewEnabled: boolean) {
  return fetchSanityQuery<PROJECT_BY_SLUG_QUERYResult>(PROJECT_BY_SLUG_QUERY, {
    params: { slug },
    tags: [`sanity:project:${slug}`, "sanity:project:list"],
    preview: previewEnabled
  });
}

export async function generateStaticParams() {
  const slugs = await fetchSanityQuery<PROJECT_SLUGS_QUERYResult>(PROJECT_SLUGS_QUERY, {
    tags: ["sanity:project:list"]
  });

  return (slugs ?? [])
    .map((entry) => entry?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

type ProjectPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type ProjectRichImage = SanityImageSource & {
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

type ProjectPageData = Omit<NonNullable<PROJECT_BY_SLUG_QUERYResult>, "gallery" | "images"> & {
  seo?: SanitySeoPayload;
  gallery?: Array<ProjectRichImage | null> | null;
  images?: Array<ProjectRichImage | null> | null;
};

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const { slug } = await params;
  const [data, siteSettings] = await Promise.all([
    loadProject(slug, isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  if (!data) {
    return buildMetadata({
      siteSeo,
      title: "Project not found"
    });
  }

  const project = data as ProjectPageData;
  const projectSeo = project.seo as SanitySeoPayload;

  return buildMetadata({
    seo: projectSeo,
    siteSeo,
    title: project.title ?? "Project",
    openGraphType: "article"
  });
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { isEnabled } = await draftMode();
  const { slug } = await params;
  const data = await loadProject(slug, isEnabled);

  if (!data) {
    notFound();
  }

  const project = data as ProjectPageData;


  type Column = {
    _key?: string;
    content?: PortableTextBlock[] | null;
  };

  const hasPortableTextContent = (column: unknown): column is Column & { content: PortableTextBlock[] } => {
    if (typeof column !== "object" || column === null) {
      return false;
    }

    const content = (column as Column).content;

    return Array.isArray(content) && content.length > 0;
  };

  const columnEntries = (project.columns ?? []).flatMap((column, index) => {
    if (!hasPortableTextContent(column)) {
      return [];
    }

    return [
      {
        key: column._key ?? `column-${index}`,
        content: column.content
      }
    ];
  });

  const additionalImages = (project.images ?? []).filter(
    (image): image is NonNullable<ProjectPageData["images"]>[number] & {
      asset: NonNullable<ProjectRichImage>["asset"];
    } => Boolean(image?.asset?._ref || image?.asset?._id)
  );
  return (
    <main className="min-h-screen bg-white text-black md:py-12 md:pb-32">
      <div className="relative flex flex-col md:block md:pt-[calc(100vh-18rem)]">

        <header className="order-2 px-6 md:px-12 grid gap-10 md:grid-cols-3">
          <div className="space-y-6">
            <h1 className="text-2xl">
              {project.title ?? "Untitled project"}
            </h1>
          {project.lines?.length ? (
            <dl className="grid md:grid-cols-2 gap-4">
              {project.lines?.map((item) => (
                <div
                  key={item.label}
                  className={`space-y-1${item.label === "Partners" ? " col-span-2" : ""}`}
                >
                  <dt className="uppercase text-[10px] tracking-[0.15em]">{item.label}</dt>
                  <dd className="text-sm">
                    {item.link ? (
                      <Link href={item.link} target="_blank" rel="noopener noreferrer">
                        {item.value}
                      </Link>
                    ) : (
                      item.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          </div>
        </header>


        <div className="order-1 mb-6 md:mb-0 md:absolute md:inset-x-0 md:inset-y-12">
          <ProjectGallery images={project.gallery} className="md:h-full" />
        </div>

        {columnEntries.length ? (
            <div className="order-3 px-6 md:px-12 mt-8 md:mt-20 md:mr-24 grid gap-8 md:grid-cols-2 md:gap-40">
              {columnEntries.map((column) => (
                <RichText
                  key={column.key}
                  value={column.content}
                  className="space-y-4 text-lg"
                />
              ))}
            </div>
          ) : null}

      </div>

      {additionalImages.length ? (
        <section className="flex flex-col gap-12 px-6 pb-24 md:px-12 max-w-4xl mx-auto my-12">
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
                <figcaption className="text-sm">
                  {image.caption}
                </figcaption>
              ) : null}
            </figure>
          ))}
        </section>
      ) : null}

      {/* {pressItems.length ? (
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
      ) : null} */}
    </main>
  );
}

