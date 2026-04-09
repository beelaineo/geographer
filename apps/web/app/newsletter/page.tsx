import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Newsletter"
};

export default function NewsletterPage() {
  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col items-center px-6 pb-20 pt-24 text-center md:px-4 md:pt-36">
      <h1 className="hidden text-base font-bold uppercase tracking-wide">Newsletter</h1>
      <p className="mt-4 max-w-3xl font-bold text-base md:text-2xl leading-relaxed">
      Sign up for the most significant Geographer updates in your mailbox, focusing on our text content. No spam, promise.
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
          placeholder="First Name"
          className="w-full border border-black bg-white px-3 py-2 focus:outline-none"
          autoComplete="given-name"
        />
        <input
          id="lastName"
          name="lastName"
          type="text"
          required
          placeholder="Last Name"
          className="w-full border border-black bg-white px-3 py-2 focus:outline-none"
          autoComplete="family-name"
        />
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="Email"
          className="w-full border border-black bg-white px-3 py-2 focus:outline-none"
          autoComplete="email"
        />

        <button
          type="submit"
          className="mt-2 w-fit appearance-none bg-transparent p-0 text-sm font-bold uppercase tracking-wide transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
        >
          Get Updates
        </button>
      </form>
    </section>
  );
}
