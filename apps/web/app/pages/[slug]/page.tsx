import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import RichText from "../../../components/RichText";
import { sanityTag } from "../../../lib/sanityCacheTags";
import { PAGE_BY_SLUG_QUERY, PAGE_SLUGS_QUERY } from "../../../lib/queries";
import { fetchSanityQuery } from "../../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../../lib/seo";

type PageData = {
  title?: string | null;
  body?: PortableTextBlock[] | null;
  seo?: SanitySeoPayload | null;
} | null;

type PageSlugRows = Array<{ slug?: string | null } | null> | null;

type StaticPageProps = {
  params: Promise<{ slug: string }>;
};

async function loadPage(slug: string, previewEnabled: boolean) {
  return fetchSanityQuery<PageData>(PAGE_BY_SLUG_QUERY, {
    params: { slug },
    tags: [sanityTag.page(slug), sanityTag.pageList],
    preview: previewEnabled
  });
}

export async function generateStaticParams() {
  const rows = await fetchSanityQuery<PageSlugRows>(PAGE_SLUGS_QUERY, {
    tags: [sanityTag.pageList]
  });

  return (rows ?? [])
    .map((row) => row?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: StaticPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const { slug } = await params;

  const [page, siteSettings] = await Promise.all([
    loadPage(slug, isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const pageSeo = page?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: pageSeo,
    siteSeo,
    title: page?.seo?.title ?? page?.title ?? "Page"
  });
}

export default async function StaticPage({ params }: StaticPageProps) {
  const { isEnabled } = await draftMode();
  const { slug } = await params;
  const page = await loadPage(slug, isEnabled);

  if (!page) {
    notFound();
  }

  const heading = page.title?.trim() || "Untitled page";
  const body = page.body;

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-16 md:px-12 md:pt-32">
      <h1 className="mb-8 text-base font-bold uppercase tracking-wide">{heading}</h1>
      {body?.length ? (
        <section className="max-w-3xl space-y-4 font-serif leading-relaxed">
          <RichText value={body} />
        </section>
      ) : null}
    </main>
  );
}
