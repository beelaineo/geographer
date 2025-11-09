import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

if (!projectId) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable");
}

if (!dataset) {
  throw new Error("Missing NEXT_PUBLIC_SANITY_DATASET environment variable");
}

export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    enabled: false
  }
});

export const previewClient = (() => {
  const token = process.env.SANITY_READ_TOKEN;

  if (!token) {
    return null;
  }

  return createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
    token,
    perspective: "previewDrafts",
    ignoreBrowserTokenWarning: true,
    stega: {
      enabled: false
    }
  });
})();

export function getClient({ preview = false }: { preview?: boolean } = {}) {
  if (preview && previewClient) {
    return previewClient;
  }

  return sanityClient;
}
