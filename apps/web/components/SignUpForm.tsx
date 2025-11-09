"use client";

import { useState } from "react";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setErrorMessage(null);
    if (status !== "idle") {
      setStatus("idle");
    }
  };

  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();

    if (!email.trim()) {
      setErrorMessage("Please enter your email address.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    setStatus("submitting");

    const formData = new FormData(event.target as HTMLFormElement);

    try {
      const response = await fetch("/form.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams(Array.from(formData.entries()) as [string, string][]).toString(),
      });

      if (!response.ok) {
        throw new Error("Request failed");
      }

      setStatus("success");
      setEmail("");
    } catch (error) {
      console.error("Form submission error:", error);
      setErrorMessage("Something went wrong. Please try again.");
      setStatus("error");
    }
  };

  return (
    <form name="newsletter-signup" onSubmit={handleFormSubmit} className="flex items-end gap-2">
      <input type="hidden" name="form-name" value="newsletter-signup" />
      <label htmlFor="email" className="sr-only">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        value={email}
        onChange={(event) => {
          setEmail(event.target.value);
          if (errorMessage) {
            resetMessages();
          }
        }}
        placeholder="Email"
        className="w-full md:w-auto border-0 border-b border-black focus:outline-none focus:border-black bg-transparent px-0 py-1"
        aria-invalid={errorMessage ? "true" : "false"}
        aria-describedby="newsletter-feedback"
      />
      <button
        type="submit"
        className="appearance-none bg-transparent border-0 p-0 m-0 cursor-pointer text-black hover:underline uppercase disabled:cursor-not-allowed disabled:opacity-60"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Submitting…" : "Submit"}
      </button>
      <span
        id="newsletter-feedback"
        role={errorMessage ? "alert" : undefined}
        aria-live="polite"
        className="text-xs uppercase tracking-wide"
      >
        {status === "success" && "Thanks for signing up!"}
        {errorMessage}
      </span>
    </form>
  );
}
