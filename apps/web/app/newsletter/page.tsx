import type { Metadata } from "next";
import { draftMode } from "next/headers";

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
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center justify-center min-h-screen px-6 pb-20 text-center">
      <h1 className="hidden type-body-sans">{title}</h1>
      <p className="mt-4 max-w-3xl type-body-sans">
        {text}
      </p>

      <form
        name="newsletter-signup"
        method="POST"
        action="/newsletter"
        data-netlify="true"
        netlify-honeypot="bot-field"
        className="mt-10 flex w-full max-w-md flex-col gap-4 text-left"
      >
        <input type="hidden" name="form-name" value="newsletter-signup" />
        <p className="hidden">
          <label htmlFor="bot-field">
            Do not fill this out if you are human: <input id="bot-field" name="bot-field" />
          </label>
        </p>

        <input
          id="firstName"
          name="firstName"
          type="text"
          required
          placeholder="first name"
          className="w-full  bg-white px-2 py-2 focus:outline-none"
          autoComplete="given-name"
        />
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          placeholder="last name"
          className="w-full bg-white p-2 focus:outline-none"
          autoComplete="family-name"
        />
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="email"
          className="w-full bg-white p-2 focus:outline-none"
          autoComplete="email"
        />

        <button
          type="submit"
          className="mt-2 w-fit type-body-sans mx-auto appearance-none bg-transparent p-0 uppercase transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          {submitButtonLabel}
        </button>
      </form>
    </section>
  );
}
