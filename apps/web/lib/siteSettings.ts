import "server-only";

import { SITE_SETTINGS_QUERY } from "./queries";
import { fetchSanityQuery } from "./sanity.fetch";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";

export async function fetchSiteSettings(previewEnabled = false): Promise<SITE_SETTINGS_QUERYResult> {
  return fetchSanityQuery<SITE_SETTINGS_QUERYResult>(SITE_SETTINGS_QUERY, {
    tags: ["sanity:siteSettings"],
    preview: previewEnabled
  });
}



