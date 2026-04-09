import { resolveProductionUrl } from "./resolveProductionUrl";

type MenuLike = {
  linkType?: string | null;
  internalLink?: {
    _type?: string | null;
    slug?: { current?: string | null } | null;
  } | null;
  externalLink?: string | null;
};

export function resolveMenuHref(item: MenuLike | null | undefined): string {
  if (!item) {
    return "/";
  }

  if (item.linkType === "internal") {
    return resolveProductionUrl(item.internalLink ?? undefined);
  }

  if (item.externalLink === "/form.html") {
    return "/newsletter";
  }

  return item.externalLink ?? "/";
}
