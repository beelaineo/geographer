"use client";

import { useState, type FormEvent } from "react";
import { markNewsletterSubscribed } from "../lib/newsletterPopupCookies";

type SubmissionState = "idle" | "submitting" | "success" | "error";

type HomepageNewsletterSignupFormProps = {
  ctaLabel: string;
  emailPlaceholder: string;
  theme?: "light" | "dark";
  className?: string;
  onSuccess?: () => void;
};

const NEWSLETTER_FORM_NAME = "newsletter-signup";
const NEWSLETTER_FORM_ACTION = "/form.html";
const NEWSLETTER_HONEYPOT_FIELD = "bot-field";

function encodeFormData(formData: FormData): string {
  const pairs: string[] = [];

  formData.forEach((value, key) => {
    pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  });

  return pairs.join("&");
}

export default function HomepageNewsletterSignupForm({
  ctaLabel,
  emailPlaceholder,
  theme = "light",
  className,
  onSuccess
}: HomepageNewsletterSignupFormProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");

  const buttonLabel =
    submissionState === "submitting"
      ? "Submitting..."
      : submissionState === "success"
        ? "Subscribed!"
        : submissionState === "error"
          ? "Error, please try again."
          : ctaLabel;
  const isSuccess = submissionState === "success";
  const fieldsStateClassName = isSuccess ? "opacity-0" : "opacity-100";
  const isDark = theme === "dark";
  const inputClassName = isDark
    ? "w-full border-0 border-b border-white bg-transparent px-0 py-1 text-center type-small-text text-white placeholder:text-center placeholder:uppercase placeholder:text-white/70 focus:border-white focus:outline-none"
    : "w-full border-0 border-b border-black bg-transparent px-0 py-1 text-center type-small-text placeholder:text-center placeholder:uppercase focus:border-black focus:outline-none";
  const buttonClassName = isDark
    ? "appearance-none bg-transparent p-0 text-center type-small-text uppercase text-white transition hover:opacity-70 underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70"
    : "appearance-none bg-transparent p-0 text-center type-small-text uppercase transition hover:underline underline-offset-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    formData.set("form-name", NEWSLETTER_FORM_NAME);
    setSubmissionState("submitting");

    try {
      const response = await fetch(NEWSLETTER_FORM_ACTION, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: encodeFormData(formData)
      });

      if (!response.ok) {
        setSubmissionState("error");
        return;
      }

      markNewsletterSubscribed();
      setSubmissionState("success");
      form.reset();
      onSuccess?.();
    } catch {
      setSubmissionState("error");
    }
  };

  return (
    <form
      name={NEWSLETTER_FORM_NAME}
      method="POST"
      action={NEWSLETTER_FORM_ACTION}
      data-netlify="true"
      data-netlify-honeypot={NEWSLETTER_HONEYPOT_FIELD}
      className={["mx-auto flex w-full max-w-[480px] flex-col items-center gap-4", className]
        .filter(Boolean)
        .join(" ")}
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value={NEWSLETTER_FORM_NAME} />
      <fieldset
        disabled={isSuccess}
        aria-hidden={isSuccess}
        className={[
          "w-full flex flex-col items-center gap-4 transition-opacity duration-200",
          fieldsStateClassName
        ].join(" ")}
      >
          <p className="hidden">
            <label htmlFor="homepage-newsletter-bot-field">
              Do not fill this out if you are human:
              <input id="homepage-newsletter-bot-field" name={NEWSLETTER_HONEYPOT_FIELD} />
            </label>
          </p>
          <div className="w-full flex gap-5 mb-2 justify-between">
            <label htmlFor="homepage-newsletter-first-name" className="sr-only">
              First name
            </label>
            <input
              id="homepage-newsletter-first-name"
              name="firstName"
              type="text"
              required
              placeholder="first name"
              autoComplete="given-name"
              className={inputClassName}
            />
            <label htmlFor="homepage-newsletter-last-name" className="sr-only">
              Last name
            </label>
            <input
              id="homepage-newsletter-last-name"
              name="lastName"
              type="text"
              required
              placeholder="last name"
              autoComplete="family-name"
              className={inputClassName}
            />
          </div>
          <label htmlFor="homepage-newsletter-email" className="sr-only">
            Email address
          </label>
          <input
            id="homepage-newsletter-email"
            name="email"
            type="email"
            required
            placeholder={emailPlaceholder}
            autoComplete="email"
            className={inputClassName}
          />
      </fieldset>
      <button
        type="submit"
        className={buttonClassName}
        disabled={submissionState === "submitting"}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
