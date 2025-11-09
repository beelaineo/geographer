import "server-only";

import { SITE_SETTINGS_QUERY } from "./queries";
import { getClient } from "./sanity.client";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";

export async function fetchSiteSettings(): Promise<SITE_SETTINGS_QUERYResult> {
  return getClient().fetch<SITE_SETTINGS_QUERYResult>(SITE_SETTINGS_QUERY);
}



