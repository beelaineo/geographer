"use client";

import { useEffect, useMemo, useState } from "react";

import {
  getNewsletterModalCloseCount,
  hasNewsletterSubscribedCookie,
  incrementNewsletterModalCloseCount
} from "../lib/newsletterPopupCookies";
import HomepageNewsletterSignupForm from "./HomepageNewsletterSignupForm";

type InterviewNewsletterModalProps = {
  title: string;
  text: string;
  ctaLabel: string;
  emailPlaceholder?: string;
};

export default function InterviewNewsletterModal({
  title,
  text,
  ctaLabel,
  emailPlaceholder = "email address"
}: InterviewNewsletterModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [canShowModal, setCanShowModal] = useState(false);

  useEffect(() => {
    const subscribed = hasNewsletterSubscribedCookie();
    const closeCount = getNewsletterModalCloseCount();
    setCanShowModal(!subscribed && closeCount < 2);
  }, []);

  useEffect(() => {
    if (!canShowModal || isDismissed) {
      return;
    }

    const onScroll = () => {
      const maxScrollable = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScrollable <= 0) {
        return;
      }

      const scrollProgress = window.scrollY / maxScrollable;
      if (scrollProgress > 0.5) {
        setIsOpen(true);
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, [canShowModal, isDismissed]);

  const panelClassName = useMemo(
    () =>
      [
        "relative w-full max-w-lg rounded-sm bg-black px-5 py-5 text-white",
        "max-h-[85vh] overflow-y-auto"
      ].join(" "),
    []
  );

  if (!canShowModal || !isOpen) {
    return null;
  }

  const closeModal = () => {
    const closeCount = incrementNewsletterModalCloseCount();
    if (closeCount >= 2) {
      setCanShowModal(false);
    }
    setIsOpen(false);
    setIsDismissed(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6" role="presentation">
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close newsletter signup modal"
        onClick={closeModal}
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={panelClassName}
      >
        <button
          type="button"
          className="absolute right-4 top-4 type-small-text uppercase text-white/80 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          aria-label="Close newsletter signup modal"
          onClick={closeModal}
        >
          <svg
            viewBox="0 0 16 16"
            width={16}
            height={16}
            aria-hidden="true"
            className="block"
          >
            <path
              d="M3 3l10 10M13 3L3 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>

        <h2 className="pr-10 type-body-sans uppercase hidden">{title}</h2>
        <p className="mt-3 type-body-sans text-white text-center max-w-xs mx-auto">{text}</p>

        <HomepageNewsletterSignupForm
          ctaLabel={ctaLabel}
          emailPlaceholder={emailPlaceholder}
          theme="dark"
          className="mt-6 mb-2 max-w-xs"
          onSuccess={() => {
            setCanShowModal(false);
            setIsOpen(false);
            setIsDismissed(true);
          }}
        />
      </section>
    </div>
  );
}
