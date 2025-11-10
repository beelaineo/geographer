import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";

import { getClient } from "../../../lib/sanity.client";

const SANITY_REVALIDATE_SECRET = process.env.SANITY_REVALIDATE_SECRET;

type SanitySlug = { current?: string | null } | string | null | undefined;

type SanityWebhookPayload = {
  _id?: string;
  _type?: string;
  slug?: SanitySlug;
  documentId?: string;
  transition?: string;
  document?: {
    _id?: string;
    _type?: string;
    slug?: SanitySlug;
  } | null;
  previous?: {
    _id?: string;
    _type?: string;
    slug?: SanitySlug;
  } | null;
};

type RevalidationResult = {
  revalidated: boolean;
  message?: string;
  tags?: string[];
};

function extractSlug(slug: SanitySlug): string | undefined {
  if (!slug) {
    return undefined;
  }

  if (typeof slug === "string") {
    return slug || undefined;
  }

  return slug.current || undefined;
}

function coerceArray<T>(value: (T | null | undefined)[]): T[] {
  return value.filter((entry): entry is T => Boolean(entry));
}

async function fetchReferencingSlugs(type: "collection" | "project", documentId: string) {
  const client = getClient();
  const result = await client.fetch<Array<{ slug?: string | null }>>(
    `*[_type == $type && references($documentId)]{ "slug": slug.current }`,
    { type, documentId },
    { cache: "no-store" }
  );

  return coerceArray(result.map((entry) => entry.slug));
}

export async function POST(request: NextRequest) {
  console.log('[Revalidate] Webhook received at:', new Date().toISOString());
  
  if (!SANITY_REVALIDATE_SECRET) {
    console.error('[Revalidate] ERROR: Missing SANITY_REVALIDATE_SECRET');
    return NextResponse.json<RevalidationResult>(
      {
        revalidated: false,
        message: "Missing SANITY_REVALIDATE_SECRET environment variable"
      },
      { status: 500 }
    );
  }

  const providedSecret =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim() ||
    request.nextUrl.searchParams.get("secret") ||
    "";

  if (providedSecret !== SANITY_REVALIDATE_SECRET) {
    console.warn('[Revalidate] WARN: Invalid secret provided');
    return NextResponse.json<RevalidationResult>(
      {
        revalidated: false,
        message: "Invalid revalidation secret"
      },
      { status: 401 }
    );
  }
  
  console.log('[Revalidate] Authentication successful');

  let payload: SanityWebhookPayload;

  try {
    payload = await request.json();
    console.log('[Revalidate] Payload received:', JSON.stringify(payload, null, 2));
  } catch (error) {
    console.error('[Revalidate] ERROR: Invalid JSON payload', error);
    return NextResponse.json<RevalidationResult>(
      {
        revalidated: false,
        message: "Invalid JSON payload"
      },
      { status: 400 }
    );
  }

  const document = payload.document ?? payload;
  const previousDocument = payload.previous ?? undefined;
  const docType = document?._type ?? previousDocument?._type;

  if (!docType) {
    console.error('[Revalidate] ERROR: Unable to determine document type');
    return NextResponse.json<RevalidationResult>(
      { revalidated: false, message: "Unable to determine document type from payload" },
      { status: 400 }
    );
  }
  
  console.log('[Revalidate] Processing document type:', docType);

  const tagsToRevalidate = new Set<string>();
  const primarySlug =
    extractSlug(document?.slug) ??
    extractSlug(payload.slug) ??
    extractSlug(previousDocument?.slug);
  const documentId = payload.documentId ?? document?._id ?? previousDocument?._id;

  switch (docType) {
    case "homepage": {
      tagsToRevalidate.add("sanity:homepage");
      break;
    }
    case "about": {
      tagsToRevalidate.add("sanity:about");
      break;
    }
    case "collection": {
      tagsToRevalidate.add("sanity:collection:list");
      if (primarySlug) {
        tagsToRevalidate.add(`sanity:collection:${primarySlug}`);
      }
      break;
    }
    case "project": {
      tagsToRevalidate.add("sanity:project:list");
      if (primarySlug) {
        tagsToRevalidate.add(`sanity:project:${primarySlug}`);
      }
      break;
    }
    case "release": {
      tagsToRevalidate.add("sanity:release:list");
      if (primarySlug) {
        tagsToRevalidate.add(`sanity:release:${primarySlug}`);
      }

      if (documentId) {
        const [collectionSlugs, projectSlugs] = await Promise.all([
          fetchReferencingSlugs("collection", documentId),
          fetchReferencingSlugs("project", documentId)
        ]);

        collectionSlugs.forEach((slug) => {
          tagsToRevalidate.add("sanity:collection:list");
          tagsToRevalidate.add(`sanity:collection:${slug}`);
        });

        projectSlugs.forEach((slug) => {
          tagsToRevalidate.add("sanity:project:list");
          tagsToRevalidate.add(`sanity:project:${slug}`);
        });
      }
      break;
    }
    case "siteSettings": {
      tagsToRevalidate.add("sanity:siteSettings");
      break;
    }
    default: {
      console.warn(`[Revalidate] WARN: Unhandled Sanity type "${docType}"`);
      return NextResponse.json<RevalidationResult>(
        {
          revalidated: false,
          message: `Unhandled Sanity type "${docType}".`
        },
        { status: 202 }
      );
    }
  }

  const tagsArray = Array.from(tagsToRevalidate);
  console.log('[Revalidate] Revalidating tags:', tagsArray);
  
  tagsToRevalidate.forEach((tag) => revalidateTag(tag));
  
  console.log('[Revalidate] SUCCESS: Revalidation complete');
  return NextResponse.json<RevalidationResult>({
    revalidated: true,
    tags: tagsArray
  });
}