"use client";

import { useRouter } from "next/navigation";

const controlClass =
  "flex items-center gap-1 uppercase type-body-sans transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function NewsletterCloseBar() {
  const router = useRouter();

  const handleClose = () => {
    if (window.history.length > 1) {
      router.back();
      return;
    }

    router.push("/");
  };

  return (
    <header className="fixed left-0 right-0 top-0 z-20 px-5 py-5">
      <div className="relative mx-auto flex min-h-[2.5rem] w-full max-w-[100vw] items-center justify-center">
        <div className="absolute left-0 top-0 z-30">
          <button
            type="button"
            className={controlClass}
            onClick={handleClose}
            aria-label="Close newsletter signup"
          >
            Close
          </button>
        </div>
      </div>
    </header>
  );
}
