"use client";

import { useState, type FormEvent } from "react";

import { markNewsletterSubscribed } from "../lib/newsletterPopupCookies";

type SubmissionState = "idle" | "submitting" | "success" | "error";

type NewsletterPageSignupFormProps = {
  submitButtonLabel: string;
};

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
    setSubmissionState("submitting");

    try {
      const response = await fetch("/", {
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

  return (
    <form
      name="newsletter-signup"
      method="POST"
      action="/"
      data-netlify="true"
      netlify-honeypot="bot-field"
      className="mt-10 flex w-full max-w-md flex-col gap-4 text-left"
      onSubmit={handleSubmit}
    >
      <input type="hidden" name="form-name" value="newsletter-signup" />
      <p className="hidden">
        <label htmlFor="newsletter-page-bot-field">
          Do not fill this out if you are human: <input id="newsletter-page-bot-field" name="bot-field" />
        </label>
      </p>

      <input
        id="newsletter-page-first-name"
        name="firstName"
        type="text"
        required
        placeholder="first name"
        className="w-full bg-white px-2 py-2 focus:outline-none"
        autoComplete="given-name"
      />
      <input
        id="newsletter-page-last-name"
        name="lastName"
        type="text"
        required
        placeholder="last name"
        className="w-full bg-white p-2 focus:outline-none"
        autoComplete="family-name"
      />
      <input
        id="newsletter-page-email"
        name="email"
        type="email"
        required
        placeholder="email"
        className="w-full bg-white p-2 focus:outline-none"
        autoComplete="email"
      />

      <button
        type="submit"
        className="mt-2 w-fit type-body-sans mx-auto appearance-none bg-transparent p-0 uppercase transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:opacity-70"
        disabled={submissionState === "submitting"}
      >
        {buttonLabel}
      </button>
    </form>
  );
}
