import type { Metadata } from "next";
import { draftMode } from "next/headers";

import NewsletterPageSignupForm from "../../components/NewsletterPageSignupForm";
import { sanityTag } from "../../lib/sanityCacheTags";
import { NEWSLETTER_DOCUMENT_QUERY } from "../../lib/queries";
import { fetchSanityQuery } from "../../lib/sanity.fetch";

export const metadata: Metadata = {
  title: "Newsletter"
};

type NewsletterDocument = {
  title: string | null;
  text: string | null;
  submitButtonLabel: string | null;
} | null;

async function loadNewsletterDocument(previewEnabled: boolean) {
  return fetchSanityQuery<NewsletterDocument>(NEWSLETTER_DOCUMENT_QUERY, {
    tags: [sanityTag.newsletter],
    preview: previewEnabled
  });
}

export default async function NewsletterPage() {
  const { isEnabled } = await draftMode();
  const newsletter = await loadNewsletterDocument(isEnabled);
  const title = newsletter?.title?.trim() || "Newsletter";
  const text =
    newsletter?.text?.trim() ||
    "Sign up for the most significant Geographer updates in your mailbox, focusing on our text content. No spam, promise.";
  const submitButtonLabel = newsletter?.submitButtonLabel?.trim() || "Submit";

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center min-h-[100svh] px-6 py-20 text-center">
      <h1 className="hidden type-body-sans">{title}</h1>
      <p className="mt-4 max-w-3xl type-body-sans">
        {text}
      </p>

      <NewsletterPageSignupForm submitButtonLabel={submitButtonLabel} />
    </section>
  );
}
