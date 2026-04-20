import type { Metadata } from "next";
import Image from "next/image";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { draftMode } from "next/headers";

import { sanityTag } from "../../lib/sanityCacheTags";
import { ABOUT_QUERY, type ABOUT_QUERYResult } from "../../lib/queries";
import RichText from "../../components/RichText";
import { getImageDimensions, urlForImageWithWidth } from "../../lib/sanityImage";
import { SignUpForm } from "../../components/SignUpForm";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

type AboutImage = {
  alt?: string | null;
  caption?: string | null;
  asset?: {
    _ref?: string | null;
    _id?: string | null;
    url?: string | null;
    metadata?: {
      blurHash?: string | null;
      dimensions?: {
        width?: number | null;
        height?: number | null;
        aspectRatio?: number | null;
      } | null;
    } | null;
  } | null;
} | null | undefined;

async function loadAbout(previewEnabled: boolean) {
  return fetchSanityQuery<ABOUT_QUERYResult>(ABOUT_QUERY, {
    tags: [sanityTag.about],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const [data, siteSettings] = await Promise.all([
    loadAbout(isEnabled),
    fetchSiteSettings(isEnabled)
  ]);

  const aboutSeo = data?.seo as SanitySeoPayload;
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    seo: aboutSeo,
    siteSeo,
    title: "About"
  });
}

export default async function AboutPage() {
  const { isEnabled } = await draftMode();
  const data = await loadAbout(isEnabled);
  const richText = data?.richText as PortableTextBlock[] | null | undefined;
 
  const hasAboutContent =
    Boolean(richText?.length)

  return (
    <main id="about" className="mx-auto max-w-2xl px-6 pb-16 pt-16 md:px-12 md:pt-[115px]">
      <div id="contributors" className="scroll-mt-32 md:scroll-mt-24" />
      {hasAboutContent ? (
            <section className="space-y-4 type-body-text">
              <RichText value={richText} />
            </section>
      ) : null}
      <div id="contact" className="scroll-mt-32 md:scroll-mt-24" />
    </main>
    
  );
}

