import type { Metadata } from "next";
import type { PortableTextBlock } from "@portabletext/types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";

import RichText from "../../components/RichText";
import { sanityTag } from "../../lib/sanityCacheTags";
import { LAST_TURN_OUR_TURN_DOCUMENT_QUERY } from "../../lib/queries";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

type LastTurnOurTurnDocument = {
  title?: string | null;
  body?: PortableTextBlock[] | null;
  seo?: SanitySeoPayload | null;
} | null;

async function loadLastTurnOurTurn(previewEnabled: boolean) {
  return fetchSanityQuery<LastTurnOurTurnDocument>(LAST_TURN_OUR_TURN_DOCUMENT_QUERY, {
    tags: [sanityTag.lastTurnOurTurn],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const [pageDoc, siteSettings] = await Promise.all([
    loadLastTurnOurTurn(isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const pageSeo = pageDoc?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: pageSeo,
    siteSeo,
    title: pageDoc?.seo?.title ?? pageDoc?.title ?? "Last Turn / Our Turn"
  });
}

export default async function LastTurnOurTurnPage() {
  const { isEnabled } = await draftMode();
  const pageDoc = await loadLastTurnOurTurn(isEnabled);

  if (!pageDoc) {
    notFound();
  }

  const body = pageDoc.body as PortableTextBlock[] | null | undefined;
  const heading = pageDoc.title?.trim() || "Last Turn / Our Turn";

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
