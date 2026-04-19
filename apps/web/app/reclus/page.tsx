import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import RichText from "../../components/RichText";
import { sanityTag } from "../../lib/sanityCacheTags";
import {
  RECLUS_DOCUMENT_QUERY,
  type RECLUS_DOCUMENT_QUERYResult
} from "../../lib/queries";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

async function loadReclusDocument(previewEnabled: boolean) {
  return fetchSanityQuery<RECLUS_DOCUMENT_QUERYResult>(RECLUS_DOCUMENT_QUERY, {
    tags: [sanityTag.reclus],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const [pageDoc, siteSettings] = await Promise.all([
    loadReclusDocument(isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const pageSeo = pageDoc?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: pageSeo,
    siteSeo,
    title: pageDoc?.seo?.title ?? pageDoc?.title ?? "Reclus"
  });
}

export default async function ReclusPage() {
  const { isEnabled } = await draftMode();
  const pageDoc = await loadReclusDocument(isEnabled);

  if (!pageDoc) {
    notFound();
  }

  const body = pageDoc.body as PortableTextBlock[] | null | undefined;
  const heading = pageDoc.title?.trim() || "Reclus";

  return (
    <div className="mx-auto max-w-2xl px-6 pb-16 pt-36 md:px-12 md:pt-24">
      <h1 className="hidden">{heading}</h1>
      {body?.length ? (
        <div className="max-w-2xl space-y-4 type-body-text">
          <RichText value={body} />
        </div>
      ) : null}
    </div>
  );
}
