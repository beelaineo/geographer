import type { Metadata } from "next";
import { draftMode } from "next/headers";

import HomepageBlocks from "../components/HomepageBlocks";
import { HOMEPAGE_QUERY, type HOMEPAGE_QUERYResult } from "../lib/queries";
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
    title: data?.seo?.title ?? siteSettings?.seo?.title ?? "Geographer"
  });
}

export default async function HomePage() {
  const { isEnabled } = await draftMode();
  const data = await loadHomepage(isEnabled);

  return (
    <div className="flex w-full flex-col">
      <HomepageBlocks blocks={data?.content} />
    </div>
  );
}
