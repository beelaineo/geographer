/**
 * Next.js fetch cache tags for Sanity-backed `fetchSanityQuery` calls.
 * The Sanity webhook (`app/api/revalidate/route.ts`) must revalidate these tags
 * when matching document types change.
 */
export const sanityTag = {
  homepage: "sanity:homepage",
  about: "sanity:about",
  siteSettings: "sanity:siteSettings",
  clubEden: "sanity:clubEden",
  reclus: "sanity:reclus",
  lastTurnOurTurn: "sanity:lastTurnOurTurn",
  releaseList: "sanity:release:list",
  interviewList: "sanity:interview:list",
  collectionList: "sanity:collection:list",
  projectList: "sanity:project:list",
  pageList: "sanity:page:list",
  release: (slug: string) => `sanity:release:${slug}`,
  interview: (slug: string) => `sanity:interview:${slug}`,
  collection: (slug: string) => `sanity:collection:${slug}`,
  project: (slug: string) => `sanity:project:${slug}`,
  page: (slug: string) => `sanity:page:${slug}`
} as const;
