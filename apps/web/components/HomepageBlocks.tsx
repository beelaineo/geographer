import type { PortableTextBlock } from "@portabletext/types";
import Image from "next/image";
import Link from "next/link";

import type { HOMEPAGE_QUERYResult } from "../types/sanity.generated";
import { colorToCss } from "../lib/sanityColor";
import { getImageDimensions, urlForImageWithWidth } from "../lib/sanityImage";
import { resolveMenuHref } from "../lib/resolveMenuHref";
import { resolveProductionUrl } from "../lib/resolveProductionUrl";
import AutoplayVideo from "./AutoplayVideo";
import ClubEdenReleaseList from "./ClubEdenReleaseList";
import RichText from "./RichText";
import HomepageRichText from "./HomepageRichText";

type Block = NonNullable<NonNullable<HOMEPAGE_QUERYResult>["content"]>[number];

type HomepageBlocksProps = {
  blocks: NonNullable<HOMEPAGE_QUERYResult>["content"] | null | undefined;
};

export default function HomepageBlocks({ blocks }: HomepageBlocksProps) {
  if (!blocks?.length) {
    return null;
  }

  return (
    <>
      {blocks.map((block) => (
        <HomepageBlock key={block._key} block={block} />
      ))}
    </>
  );
}

function HomepageBlock({ block }: { block: Block }) {
  switch (block._type) {
    case "homepageVideoBanner":
      return <HomepageVideoBannerSection block={block} />;
    case "homepageFeaturedInterview":
      return <HomepageFeaturedInterviewSection block={block} />;
    case "homepageTextBlock":
      return <HomepageTextBlockSection block={block} />;
    case "homepageFeaturedReleases":
      return <HomepageFeaturedReleasesSection block={block} />;
    default:
      return null;
  }
}

function HomepageVideoBannerSection({
  block
}: {
  block: Extract<Block, { _type: "homepageVideoBanner" }>;
}) {
  const playbackId = block.video?.asset?.playbackId;
  const bg = colorToCss(block.backgroundColor ?? undefined);

  return (
    <section
      className="flex min-h-[80vh] w-full items-center justify-center px-6 pt-40 py-20 md:px-12"
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {playbackId ? (
        <div
          className="flex w-[50vw] max-w-full justify-center"
          style={{ willChange: "transform" }}
        >
          <AutoplayVideo
            playbackId={playbackId}
            accessibilityLabel={block.mediaDescription ?? undefined}
            className="h-auto w-full max-h-[70vh] object-contain bg-transparent"
          />
        </div>
      ) : null}
    </section>
  );
}

function HomepageFeaturedInterviewSection({
  block
}: {
  block: Extract<Block, { _type: "homepageFeaturedInterview" }>;
}) {
  const interview = block.interview;
  const cover = interview?.cover;
  const href = interview ? resolveProductionUrl(interview) : "/";
  const coverUrl = cover?.asset ? urlForImageWithWidth(cover, 600).url() : null;
  const { width: dimW, height: dimH } = getImageDimensions(cover ?? undefined);
  const displayW = 300;
  const displayH = Math.max(1, Math.round((dimH / dimW) * displayW));

  const inner = (
    <>
      {coverUrl && cover ? (
        <Image
          src={coverUrl}
          alt={cover.alt ?? interview?.title ?? ""}
          width={displayW}
          height={displayH}
          className="w-[300px] max-w-full object-cover"
          sizes="300px"
        />
      ) : null}
      {block.title ? (
        <p className="mt-6 max-w-[300px] text-center uppercase font-bold tracking-wide">{block.title}</p>
      ) : null}
    </>
  );

  return (
    <section className="w-full bg-transparent px-6 py-16 md:px-12">
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        {interview?.slug?.current ? (
          <Link href={href} className="flex flex-col items-center transition hover:opacity-80">
            {inner}
          </Link>
        ) : (
          <div className="flex flex-col items-center">{inner}</div>
        )}
      </div>
    </section>
  );
}

function HomepageTextBlockSection({
  block
}: {
  block: Extract<Block, { _type: "homepageTextBlock" }>;
}) {
  const body = block.body as PortableTextBlock[] | null | undefined;
  const cta = block.cta;
  const ctaHref = cta ? resolveMenuHref(cta) : "/";
  const showCta = Boolean(cta?.label?.trim());
  const ctaIsExternal = ctaHref.startsWith("http");
  const ctaClass =
    "text-sm font-bold uppercase tracking-widest transition hover:underline underline-offset-4";

  return (
    <section className="w-full px-6 py-8 md:px-12">
      <div className="mx-auto max-w-3xl text-center">
        <HomepageRichText value={body} className="space-y-4 text-center font-bold tracking-wide [&_blockquote]:mx-auto [&_blockquote]:max-w-prose [&_blockquote]:text-left" />
        {showCta ? (
          <p className="mt-10">
            {ctaIsExternal ? (
              <a
                href={ctaHref}
                target="_blank"
                rel="noopener noreferrer"
                className={ctaClass}
              >
                {cta?.label}
              </a>
            ) : (
              <Link href={ctaHref} className={ctaClass}>
                {cta?.label}
              </Link>
            )}
          </p>
        ) : null}
      </div>
    </section>
  );
}

function HomepageFeaturedReleasesSection({
  block
}: {
  block: Extract<Block, { _type: "homepageFeaturedReleases" }>;
}) {
  const image = block.image;
  const imageUrl = image?.asset ? urlForImageWithWidth(image, 720).url() : null;
  const { width: dimW, height: dimH } = getImageDimensions(image ?? undefined);
  const displayW = 360;
  const displayH = Math.max(1, Math.round((dimH / dimW) * displayW));
  const releases = (block.releases ?? []).filter(Boolean);

  return (
    <section className="w-full px-6 py-12 md:px-12">
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-8">
        {block.title ? <h2 className="hidden">{block.title}</h2> : null}
        {imageUrl && image ? (
          <Image
            src={imageUrl}
            alt={image.alt ?? ""}
            width={displayW}
            height={displayH}
            className="w-[360px] max-w-full object-cover"
            sizes="360px"
          />
        ) : null}
        <ClubEdenReleaseList releases={releases} showColumnHeadings={false} />
      </div>
    </section>
  );
}
