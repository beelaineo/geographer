import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import { sanityTag } from "../../lib/sanityCacheTags";
import { CONTRIBUTORS_DOCUMENT_QUERY } from "../../lib/queries";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

type ContributorListItem = {
  _id: string;
  name?: string | null;
  sortName?: string | null;
  link?: string | null;
} | null;

type ContributorsDocument = {
  title?: string | null;
  list?: ContributorListItem[] | null;
  seo?: SanitySeoPayload | null;
} | null;

async function loadContributorsPage(previewEnabled: boolean) {
  return fetchSanityQuery<ContributorsDocument>(CONTRIBUTORS_DOCUMENT_QUERY, {
    tags: [sanityTag.contributors],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const [page, siteSettings] = await Promise.all([
    loadContributorsPage(isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const pageSeo = page?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: pageSeo,
    siteSeo,
    title: page?.seo?.title ?? page?.title ?? "Contributors"
  });
}

export default async function ContributorsPage() {
  const { isEnabled } = await draftMode();
  const page = await loadContributorsPage(isEnabled);

  if (!page) {
    notFound();
  }

  const heading = page.title?.trim() || "Contributors";

  const contributors: NonNullable<ContributorListItem>[] = [
    ...(page.list ?? []).filter((entry): entry is NonNullable<ContributorListItem> =>
      Boolean(entry?._id)
    ),
  ].sort((a, b) => {
    const getSortKey = (entry: NonNullable<ContributorListItem>) => {
      const normalizedSortName = entry.sortName?.trim().toLowerCase() || "";
      const normalizedName = entry.name?.trim().toLowerCase() || "";
      const lastWord = normalizedName.split(/\s+/).pop() || normalizedName;
      const primaryKey = normalizedSortName || lastWord;
      return [primaryKey, normalizedName] as const;
    };

    const [aKey, aLast] = getSortKey(a);
    const [bKey, bLast] = getSortKey(b);

    if (aKey < bKey) return -1;
    if (aKey > bKey) return 1;
    if (aLast < bLast) return -1;
    if (aLast > bLast) return 1;
    return 0;
  });

  return (
    <main className="mx-auto max-w-3xl px-6 pb-16 pt-64 md:px-5 md:pt-[115px]">
      <h1 className="hidden">{heading}</h1>
      {contributors.length ? (
        <section className="">
          <ul className="columns-1 md:columns-3 md:gap-8 type-body-text text-center">
            {contributors.map((contributor) => {
              const label = contributor.name?.trim() || "Untitled contributor";

              return (
                <li key={contributor._id} className="mb-1 break-inside-avoid">
                  {contributor.link ? (
                    <a
                      href={contributor.link}
                      className="underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                      {label}
                    </a>
                  ) : (
                    <span>{label}</span>
                  )}
                </li>
              );
            })}
          </ul>
        </section>
      ) : null}
    </main>
  );
}
