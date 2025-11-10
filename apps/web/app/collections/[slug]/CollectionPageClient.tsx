"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { COLLECTION_BY_SLUG_QUERYResult } from "../../../types/sanity.generated";
import ReleaseCard from "../../../components/ReleaseCard";
import ReleaseCarousel from "../../../components/ReleaseCarousel";

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
  published?: boolean | null;
};

type CollectionPageClientProps = {
  releases: (Release | null)[];
};

export default function CollectionPageClient({ releases }: CollectionPageClientProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const expandedCardRef = useRef<HTMLDivElement>(null);

  const handleToggle = (id: string) => {
    if (expandedId === id) {
      // Closing
      setIsClosing(true);
      setExpandedId(null);
      // Reset closing state after animation would complete
      setTimeout(() => setIsClosing(false), 100);
    } else {
      // Opening
      setIsClosing(false);
      setExpandedId(id);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setExpandedId(null);
    setTimeout(() => setIsClosing(false), 100);
  };

  const hasExpanded = expandedId !== null;
  const expandedRelease = releases.find((r) => r?._id === expandedId);

  // Auto-scroll when card expands
  useEffect(() => {
    if (hasExpanded && expandedCardRef.current) {
      // Delay scroll until card has moved to position
      const scrollTimer = setTimeout(() => {
        const rect = expandedCardRef.current?.getBoundingClientRect();
        if (rect) {
          const scrollTop = window.scrollY + rect.top;
          window.scrollTo({
            top: scrollTop,
            behavior: "smooth"
          });
        }
      }, 450); // Wait for card movement animation

      return () => clearTimeout(scrollTimer);
    }
  }, [hasExpanded]);

  return (
    <>
      {releases.length ? (
        <section className="my-16">
          {/* Mobile: Carousel or Expanded View */}
          <div className="md:hidden">
            <AnimatePresence mode="wait">
              {expandedId && expandedRelease ? (
                <motion.div
                  key="expanded-mobile"
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 30, stiffness: 300 }}
                  className="fixed inset-0 z-50 bg-white overflow-y-auto"
                >
                  <ReleaseCard
                    release={expandedRelease}
                    isExpanded={true}
                    onToggle={() => expandedRelease._id && handleToggle(expandedRelease._id)}
                    onClose={handleClose}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="carousel"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ReleaseCarousel
                    releases={releases}
                    onCardClick={handleToggle}
                    expandedId={expandedId}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop: Grid with Expandable Cards */}
          <div className="px-6 md:px-12 hidden md:block" ref={expandedCardRef}>
            <div className="grid grid-cols-4 gap-0 relative">
              {releases.map((release, index) => {
                const isExpanded = release?._id === expandedId;
                const shouldHide = expandedId && !isExpanded;
                
                return (
                  <motion.div
                    key={release?._id ?? release?.slug?.current ?? index}
                    initial={false}
                    animate={{ 
                      opacity: shouldHide ? 0 : 1,
                      pointerEvents: shouldHide ? "none" : "auto",
                      position: isExpanded ? "absolute" : "relative",
                      left: isExpanded ? 0 : "auto",
                      top: isExpanded ? 0 : "auto",
                      zIndex: isExpanded ? 10 : 1
                    }}
                    transition={isClosing ? { 
                      // Instant transitions when closing
                      opacity: { duration: 0 },
                      position: { duration: 0 },
                      left: { duration: 0 },
                      top: { duration: 0 }
                    } : { 
                      // Smooth transitions when opening
                      opacity: { duration: 0.15 },
                      position: { duration: 0 },
                      left: { duration: 0.4, ease: [0.4, 0, 0.2, 1] },
                      top: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
                    }}
                  >
                    <ReleaseCard
                      release={release}
                      isExpanded={isExpanded}
                      isClosing={isClosing}
                      onToggle={() => release?._id && handleToggle(release._id)}
                      onClose={handleClose}
                    />
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}
    </>
  );
}

