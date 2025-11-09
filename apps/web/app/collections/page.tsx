import Link from "next/link";
import { draftMode } from "next/headers";

import {
  COLLECTIONS_QUERY,
  type COLLECTIONS_QUERYResult
} from "../../lib/queries";
import { getClient } from "../../lib/sanity.client";

export const revalidate = 180;

async function loadCollections(previewEnabled: boolean) {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<COLLECTIONS_QUERYResult>(COLLECTIONS_QUERY);
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

