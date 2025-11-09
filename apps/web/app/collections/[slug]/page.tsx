import type { Metadata } from "next";
import Image from "next/image";
import type { PortableTextBlock } from "@portabletext/types";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { cache } from "react";

import {
  COLLECTION_BY_SLUG_QUERY,
  COLLECTION_SLUGS_QUERY,
  type COLLECTION_BY_SLUG_QUERYResult,
  type COLLECTION_SLUGS_QUERYResult
} from "../../../lib/queries";
import { getClient } from "../../../lib/sanity.client";
import { urlForImageWithWidth } from "../../../lib/sanityImage";
import RichText from "../../../components/RichText";
import ReleaseCarousel from "../../../components/ReleaseCarousel";
import ReleaseCard from "../../../components/ReleaseCard";

export const revalidate = 180;

const loadCollection = cache(async (slug: string, previewEnabled: boolean) => {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<COLLECTION_BY_SLUG_QUERYResult>(COLLECTION_BY_SLUG_QUERY, { slug });
});

export async function generateStaticParams() {
  const client = getClient();
  const slugs = await client.fetch<COLLECTION_SLUGS_QUERYResult>(COLLECTION_SLUGS_QUERY);

  return (slugs ?? [])
    .map((entry) => entry?.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

type CollectionPageProps = {
  params: {
    slug: string;
  };
};

type CollectionPageData = NonNullable<COLLECTION_BY_SLUG_QUERYResult> & {
  hero?: (SanityImageSource & { alt?: string | null }) | null;
};

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const data = await loadCollection(params.slug, isEnabled);

  if (!data) {
    return {
      title: "Collection not found"
    };
  }

  return {
    title: data.title ?? "Collection",
    description: data.location ?? data.partners ?? undefined
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const { isEnabled } = await draftMode();
  const data = await loadCollection(params.slug, isEnabled);

  if (!data) {
    notFound();
  }

  const collection = data as CollectionPageData;

  const hero = collection.hero ?? null;
  const heroImage = hero ? urlForImageWithWidth(hero, 2440).height(1760).url() : null;
  const heroAlt = hero?.alt ?? collection.title ?? "Collection hero image";

  const metaItems = [
    { label: "Location", value: collection.location },
    { label: "Dates", value: collection.dates },
    { label: "Partners", value: collection.partners },
    {
      label: "Press",
      value: collection.press?.map((item) => item?.title).filter(Boolean).join(", ")
    }
  ].filter((item) => item.value);

  const releases = (collection.releases ?? []).filter(Boolean);

  return (
    <main className="bg-white text-black">
      {heroImage ? (
        <section className="relative h-[360px] w-full overflow-hidden md:h-[480px] lg:h-[560px]">
          <Image
            src={heroImage}
            alt={heroAlt}
            fill
            priority
            className="object-cover object-bottom"
            sizes="100vw"
          />
        </section>
      ) : null}

      <div className="pb-16 pt-12">
        <header className="px-6 md:px-12 grid gap-10 md:grid-cols-3">
          <div className="space-y-6">
            <h1 className="text-2xl">
              {collection.title ?? "Collection"}
            </h1>
          {metaItems.length ? (
            <dl className="grid grid-cols-2 gap-4">
              {metaItems.map((item) => (
                <div
                  key={item.label}
                  className={`space-y-1${item.label === "Partners" ? " col-span-2" : ""}`}
                >
                  <dt className="uppercase text-[10px] tracking-[0.15em]">{item.label}</dt>
                  <dd className="text-sm">
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>
          ) : null}
          </div>
          {collection.intro ? (
            <section className="col-span-2">
              <RichText
                value={collection.intro as PortableTextBlock[]}
                className="md:columns-2 md:gap-10 text-lg"
              />
            </section>
        ) : null}
        </header>

        {releases.length ? (
          <section className="my-16">
            <div className="md:hidden">
              <ReleaseCarousel releases={releases} />
            </div>
            <div className="px-6 md:px-12 hidden md:grid md:grid-cols-4 md:gap-0">
              {releases.map((release, index) => (
                <ReleaseCard
                  key={release?._id ?? release?.slug?.current ?? index}
                  release={release}
                />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

