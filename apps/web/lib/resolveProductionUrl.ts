type HasSlug = {
  slug?: {
    current?: string | null;
  } | null;
};

type SanityDocumentLike = HasSlug & {
  _type?: string | null;
};

const DEFAULT_ROUTE = "/";

export function resolveProductionUrl(document?: SanityDocumentLike | null): string {
  if (!document?._type) {
    return DEFAULT_ROUTE;
  }

  const slug = document.slug?.current ?? undefined;

  switch (document._type) {
    case "homepage":
      return DEFAULT_ROUTE;
    case "about":
      return "/about";
    case "clubEden":
      return "/club-eden";
    case "reclus":
      return "/reclus";
    case "lastTurnOurTurn":
      return "/last-turn-our-turn";
    case "page":
      return slug ? `/pages/${slug}` : "/pages";
    case "collection":
      return slug ? `/collections/${slug}` : "/collections";
    case "project":
      return slug ? `/projects/${slug}` : "/projects";
    case "release":
      return slug ? `/releases/${slug}` : "/releases";
    case "interview":
      return slug ? `/interviews/${slug}` : "/interviews";
    default:
      return DEFAULT_ROUTE;
  }
}


