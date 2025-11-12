"use client";

import Image from "next/image";
import { motion } from "framer-motion";

import { urlForImageWithWidth } from "../lib/sanityImage";
import type { COLLECTION_BY_SLUG_QUERYResult } from "../types/sanity.generated";

type ReleaseImage = {
  alt?: string | null;
  asset?: { _ref?: string | null; url?: string | null } | null;
};

type Release = NonNullable<
  NonNullable<COLLECTION_BY_SLUG_QUERYResult>["releases"]
>[number] & {
  cover?: ReleaseImage | null;
  coverAlt?: ReleaseImage | null;
  intro?: string | null;
  quote?: string | null;
  embed?: string | null;
  release_date?: string | null;
};

type ReleaseCardProps = {
  release: Release | null | undefined;
  className?: string;
  isExpanded?: boolean;
  isClosing?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
};

export default function ReleaseCard({
  release,
  className,
  isExpanded = false,
  isClosing = false,
  onToggle,
  onClose
}: ReleaseCardProps) {
  if (!release) {
    return null;
  }

  const cover = release.cover ?? release.coverAlt;
  const coverAlt = release.coverAlt;
  const alt = cover?.alt ?? release.title ?? "Release cover";
  const imageUrl = cover ? urlForImageWithWidth(cover, 668).height(835).url() : null;
  const coverAltImageUrl = coverAlt
    ? urlForImageWithWidth(coverAlt, 668).height(835).url()
    : null;

  const releaseDate = release.release_date
    ? new Date(
        release.release_date.length <= 10
          ? `${release.release_date}T00:00:00Z`
          : release.release_date
      )
    : null;

  const isPublished = release.published ?? false;

  const hasAdditionalContent = Boolean(
    release.intro || release.quote || release.embed || coverAltImageUrl
  );

  const handleClick = () => {
    // Prevent expansion if not published
    if (onToggle && hasAdditionalContent && isPublished) {
      onToggle();
    }
  };

  // Animation variants with sequenced timing
  const coverAltVariants = {
    hidden: { 
      opacity: 0, 
      x: 20,
      transition: { duration: isClosing ? 0 : 0.2 }
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { 
        duration: isClosing ? 0 : 0.2, 
        delay: isClosing ? 0 : 0.3 // Wait for card to move to left
      }
    }
  };

  const contentVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      transition: { duration: isClosing ? 0 : 0.2 }
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: { 
        duration: isClosing ? 0 : 0.2, 
        delay: isClosing ? 0 : 0.5 // Wait for images to settle
      }
    }
  };

  const backButtonVariants = {
    hidden: { 
      opacity: 0,
      transition: { duration: isClosing ? 0 : 0.2 }
    },
    visible: {
      opacity: 1,
      transition: { 
        duration: isClosing ? 0 : 0.2, 
        delay: isClosing ? 0 : 0.5
      }
    }
  };

  const introVariants = {
    hidden: { 
      opacity: 0,
      transition: { duration: isClosing ? 0 : 0.2 }
    },
    visible: {
      opacity: 1,
      transition: { 
        duration: isClosing ? 0 : 0.3, 
        delay: isClosing ? 0 : 0.4
      }
    }
  };

  const quoteVariants = {
    hidden: { 
      opacity: 0,
      transition: { duration: isClosing ? 0 : 0.2 }
    },
    visible: {
      opacity: 1,
      transition: { 
        duration: isClosing ? 0 : 0.4, 
        delay: isClosing ? 0 : 0.7 // Appear after other content
      }
    }
  };

  return (
    <article
      className={[
        "relative flex flex-col items-stretch gap-3 text-lg",
        onToggle && hasAdditionalContent && isPublished ? "cursor-pointer" : "",
        !isPublished ? "cursor-not-allowed" : "",
        className
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={!isExpanded ? handleClick : undefined}
    >

      {/* Images Container */}
      <div
        className={[
          "flex",
          isExpanded ? "flex-row gap-0" : "flex-col gap-3"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {/* Primary Cover Image - Fixed size */}
        <div
          className={[
            "relative overflow-hidden shrink-0",
            isExpanded ? "w-[50vw] md:w-[calc((100vw-96px)/4)]" : "w-full"
          ].filter(Boolean).join(" ")}
          style={
            isExpanded
              ? { aspectRatio: "668/835" }
              : {}
          }
        >
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={alt}
              width={668}
              height={835}
              sizes={
                isExpanded
                  ? "(max-width: 768px) 50vw, calc((100vw - 96px) / 4)"
                  : "(max-width: 768px) 75vw, 25vw"
              }
              className={[
                "object-contain",
                !isPublished ? "grayscale" : ""
              ].filter(Boolean).join(" ")}
              style={{ width: "100%", height: "100%" }}
              priority={false}
            />
          ) : (
            <div className="flex h-full min-h-[400px] items-center justify-center bg-neutral-300">
              <span className="text-2xl">No cover</span>
            </div>
          )}
        </div>

        {/* Cover Alt Image - Only when expanded */}
        {isExpanded && coverAltImageUrl && !isClosing && (
          <motion.div
            key="cover-alt"
            variants={coverAltVariants}
            initial="hidden"
            animate="visible"
            className="relative overflow-hidden bg-white shrink-0 w-[50vw] md:w-[calc((100vw-96px)/4)]"
            style={{ aspectRatio: "668/835" }}
          >
            <Image
              src={coverAltImageUrl}
              alt={coverAlt?.alt ?? (release.title ? `${release.title} alternate cover` : "Alternate cover")}
              width={668}
              height={835}
              sizes="(max-width: 768px) 50vw, 668px"
              className={[
                "object-contain",
                !isPublished ? "grayscale" : ""
              ].filter(Boolean).join(" ")}
              style={{ width: "100%", height: "100%" }}
              priority={false}
            />
          </motion.div>
        )}
      </div>

      {/* Title and Date */}
      <div
        className={[
          "flex flex-col gap-0 text-xl md:text-2xl md:max-w-[calc(50vw-48px)]",
          isExpanded ? "px-4 md:px-0" : "pl-2 md:pl-0"
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="text-lg md:text-xl leading-relaxed">
          {release.title ?? "Untitled release"}
          {release.intro && isExpanded && !isClosing && (
            <motion.span
              variants={introVariants}
              initial="hidden"
              animate="visible"
            >
              {" "}{release.intro}
            </motion.span>
          )}
        </span>
        {releaseDate && !isExpanded ? (
          <span className="text-sm md:text-base">
            {new Intl.DateTimeFormat("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric"
            }).format(releaseDate)}
          </span>
        ) : null}
      </div>

      {/* Additional Content - Only when expanded */}
      {isExpanded && !isClosing && (
        <motion.div
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8 pt-4 md:pt-0 px-4 md:px-0 md:max-w-[calc(50vw-48px)]"
        >
             {/* Embed */}
             {release.embed && (
              <div className="space-y-2">
                <div
                  className="overflow-hidden bg-gray-100 shadow-md p-4"
                  dangerouslySetInnerHTML={{ __html: release.embed }}
                />
              </div>
            )}

            {/* Back Button */}
            {onClose && (
              <motion.button
                variants={backButtonVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                className="flex items-center gap-2 text-sm uppercase tracking-wider hover:opacity-60 transition-opacity"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 12L6 8L10 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Back
              </motion.button>
            )}

        </motion.div>
      )}

      {/* Quote - Outside motion.div for smooth animation */}
      {isExpanded && !isClosing && release.quote && (
        <motion.blockquote
          variants={quoteVariants}
          initial="hidden"
          animate="visible"
          className="relative text-base md:text-lg text-[#771214] md:max-w-[25vw] md:absolute md:-right-[33vw] top-5 md:top-1/2 md:-translate-y-1/2 px-10 md:px-0"
        >
          <span className="absolute -top-2 left-4 md:-left-5 text-4xl leading-none text-[#771214]">&ldquo;</span>
          {release.quote}
          <span className="absolute -bottom-4 right-4 md:-right-5 text-4xl leading-none text-[#771214]">&rdquo;</span>
        </motion.blockquote>
      )}
    </article>
  );
}
