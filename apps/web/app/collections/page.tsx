import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";

import {
  COLLECTIONS_QUERY,
  type COLLECTIONS_QUERYResult
} from "../../lib/queries";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

async function loadCollections(previewEnabled: boolean) {
  return fetchSanityQuery<COLLECTIONS_QUERYResult>(COLLECTIONS_QUERY, {
    tags: ["sanity:collection:list"],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    siteSeo,
    title: "Collections"
  });
}

export default async function CollectionsPage() {
  const { isEnabled } = await draftMode();
  const collections = (await loadCollections(isEnabled)) ?? [];

  return (
    <main>
      <h1>Collections</h1>
      {collections.length ? (
        <ul>
          {collections.map((collection) => {
            const slug = collection?.slug?.current;
            const href = slug ? `/collections/${slug}` : "#";

            return (
              <li key={collection?._id ?? slug}>
                <Link href={href}>{collection?.title ?? "Untitled collection"}</Link>
                {collection?.location ? <span> – {collection.location}</span> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No collections available.</p>
      )}
    </main>
  );
}

