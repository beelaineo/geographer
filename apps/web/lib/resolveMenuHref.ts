import { resolveProductionUrl } from "./resolveProductionUrl";

type MenuLike = {
  linkType?: string | null;
  internalLink?: {
    _type?: string | null;
    slug?: { current?: string | null } | null;
  } | null;
  subLink?: string | null;
  externalLink?: string | null;
};

function appendSubLink(baseHref: string, subLink: string | null | undefined): string {
  const suffix = subLink?.trim();
  if (!suffix) {
    return baseHref;
  }

  const normalizedSuffix = suffix.startsWith("/") ? suffix : `/${suffix}`;
  const normalizedBase = baseHref === "/" ? "" : baseHref.replace(/\/$/, "");
  return `${normalizedBase}${normalizedSuffix}`;
}

export function resolveMenuHref(item: MenuLike | null | undefined): string {
  if (!item) {
    return "/";
  }

  if (item.linkType === "internal") {
    const baseHref = resolveProductionUrl(item.internalLink ?? undefined);
    return appendSubLink(baseHref, item.subLink);
  }

  if (item.externalLink === "/form.html") {
    return "/newsletter";
  }

  return item.externalLink ?? "/";
}
