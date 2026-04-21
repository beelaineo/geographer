"use client";

import { useState, type FormEvent } from "react";

import { markNewsletterSubscribed } from "../lib/newsletterPopupCookies";

type SubmissionState = "idle" | "submitting" | "success" | "error";

type NewsletterPageSignupFormProps = {
  submitButtonLabel: string;
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

export default function NewsletterPageSignupForm({ submitButtonLabel }: NewsletterPageSignupFormProps) {
  const [submissionState, setSubmissionState] = useState<SubmissionState>("idle");

  const buttonLabel =
    submissionState === "submitting"
      ? "Submitting..."
      : submissionState === "success"
        ? "Subscribed!"
        : submissionState === "error"
          ? "Error, please try again."
          : submitButtonLabel;

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
    } catch {
      setSubmissionState("error");
    }
  };

  const inputClassName = "w-full bg-white p-2 text-center type-small-text placeholder:text-center placeholder:uppercase focus:border-black focus:outline-none";
  const buttonClassName = "mt-0 w-fit p-2 mx-auto text-center type-small-text appearance-none bg-transparent uppercase transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70";


  return (
    <form
      name={NEWSLETTER_FORM_NAME}
      method="POST"
      action={NEWSLETTER_FORM_ACTION}
      data-netlify="true"
      data-netlify-honeypot={NEWSLETTER_HONEYPOT_FIELD}
      className="mt-10 flex w-full max-w-md flex-col gap-4 text-left"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value={NEWSLETTER_FORM_NAME} />
      <p className="hidden">
        <label htmlFor="newsletter-page-bot-field">
          Do not fill this out if you are human: <input id="newsletter-page-bot-field" name={NEWSLETTER_HONEYPOT_FIELD} />
        </label>
      </p>

      <input
        id="newsletter-page-first-name"
        name="firstName"
        type="text"
        required
        placeholder="first name"
        className={inputClassName}
        autoComplete="given-name"
      />
      <input
        id="newsletter-page-last-name"
        name="lastName"
        type="text"
        required
        placeholder="last name"
        className={inputClassName}
        autoComplete="family-name"
      />
      <input
        id="newsletter-page-email"
        name="email"
        type="email"
        required
        placeholder="email"
        className={inputClassName}
        autoComplete="email"
      />

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
