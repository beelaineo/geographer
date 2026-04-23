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
import HomepageNewsletterSignupForm from "./HomepageNewsletterSignupForm";

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
    case "homepageNewsletterSignup":
      return <HomepageNewsletterSignupSection block={block} />;
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
      className="flex min-h-[50vh] md:min-h-[85vh] w-full items-center justify-center px-5 pt-40 pb-10 md:px-10 md:py-20"
      style={bg ? { backgroundColor: bg } : undefined}
    >
      {playbackId ? (
        <div
          className="flex md:w-[50vw] max-w-full justify-center"
          style={{ willChange: "transform" }}
        >
          <AutoplayVideo
            playbackId={playbackId}
            accessibilityLabel={block.mediaDescription ?? undefined}
            className="h-auto w-full max-w-2xl max-h-[70vh] object-contain bg-transparent"
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
  const coverUrl = cover?.asset ? urlForImageWithWidth(cover, 1200).url() : null;
  const quote = interview?.quote?.trim();
  const { width: dimW, height: dimH } = getImageDimensions(cover ?? undefined);
  const displayW = 420;
  const displayH = Math.max(1, Math.round((dimH / dimW) * displayW));

  const inner = (
    <>
      {coverUrl && cover ? (
        <div className="relative max-w-full">
          <Image
            src={coverUrl}
            alt={cover.alt ?? interview?.title ?? ""}
            width={displayW}
            height={displayH}
            className="h-auto max-h-[75vh] max-w-[min(100%,420px)] object-contain"
            sizes="(max-width: 768px) 100vw, 420px"
          />
          {quote ? (
            <span className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white p-4 text-center type-body-text text-black opacity-0 transition-opacity duration-200 ease-out md:group-hover:opacity-100 md:group-focus-within:opacity-100">
              &ldquo;{quote}&rdquo;
            </span>
          ) : null}
        </div>
      ) : null}
        <p className="mt-5 max-w-[320px] text-center uppercase type-small-text">In Conversation: {interview?.title}</p>
    </>
  );

  return (
    <section className="w-full bg-transparent px-5 py-16 md:px-5">
      <div className="mx-auto flex max-w-4xl flex-col items-center">
        {interview?.slug?.current ? (
          <Link href={href} className="group flex flex-col items-center">
            {inner}
          </Link>
        ) : (
          <div className="group flex flex-col items-center">{inner}</div>
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
    "type-small-text uppercase transition hover:underline underline-offset-4";

  return (
    <section className="w-full px-5 py-8 md:px-5">
      <div className="mx-auto max-w-2xl text-center">
        <HomepageRichText value={body} className="space-y-5 text-center [&_blockquote]:mx-auto [&_blockquote]:max-w-prose [&_blockquote]:text-left" />
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
  const hoverImage = block.hoverImage;
  const hoverImageUrl = hoverImage?.asset
    ? urlForImageWithWidth(hoverImage, 720).url()
    : null;
  const { width: dimW, height: dimH } = getImageDimensions(image ?? undefined);
  const displayW = 360;
  const displayH = Math.max(1, Math.round((dimH / dimW) * displayW));
  const releases = (block.releases ?? []).filter(Boolean);

  return (
    <section className="w-full px-5 py-14">
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 md:px-12">
        {block.title ? <h2 className="hidden">{block.title}</h2> : null}
        {imageUrl && image ? (
          <Link href="/clubeden" className="group">
            <span className="relative block w-[380px] px-5 md:px-0 max-w-full">
              <Image
                src={imageUrl}
                alt={image.alt ?? ""}
                width={displayW}
                height={displayH}
                className="h-auto w-full object-cover transition-opacity duration-200 ease-out md:group-hover:opacity-0 md:group-focus-visible:opacity-0"
                sizes="380px"
              />
              {hoverImageUrl ? (
                <Image
                  src={hoverImageUrl}
                  alt=""
                  aria-hidden
                  fill
                  className="pointer-events-none absolute inset-0 hidden object-cover opacity-0 transition-opacity duration-200 ease-out md:block md:group-hover:opacity-100 md:group-focus-visible:opacity-100"
                  sizes="380px"
                />
              ) : null}
            </span>
          </Link>
        ) : null}
        {releases.length ? (
          <ClubEdenReleaseList releases={releases} showColumnHeadings={false} />
        ) : null}
      </div>
    </section>
  );
}

function HomepageNewsletterSignupSection({
  block
}: {
  block: Extract<Block, { _type: "homepageNewsletterSignup" }>;
}) {
  const ctaLabel = block.ctaLabel?.trim() || "Submit";
  const emailPlaceholder = block.emailPlaceholder?.trim() || "email address";

  return (
    <section className="w-full px-5 py-8 md:px-5">
      <div className="mx-auto max-w-3xl">
        <HomepageNewsletterSignupForm ctaLabel={ctaLabel} emailPlaceholder={emailPlaceholder} />
      </div>
    </section>
  );
}
