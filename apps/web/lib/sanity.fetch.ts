import "server-only";

import { getClient } from "./sanity.client";

type QueryParams = Record<string, unknown>;

type FetchOptions = {
  params?: QueryParams;
  tags: string[];
  preview?: boolean;
};

export async function fetchSanityQuery<Result>(
  query: string,
  { params, tags, preview = false }: FetchOptions
): Promise<Result> {
  const client = getClient({ preview });

  const fetchOptions = preview
    ? { cache: "no-store" as const }
    : {
        cache: "force-cache" as const,
        next: { tags }
      };

  return client.fetch<Result>(query, params ?? {}, fetchOptions);
}

