"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLayoutEffect, useState } from "react";

import { RELEASE_FROM_INTERNAL_NAV_STORAGE_KEY } from "../lib/releaseNavigation";

const controlClass =
  "flex items-center gap-1 text-base font-bold uppercase tracking-wider transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ReleaseCloseBar() {
  const router = useRouter();
  const [fromInternalNavigation, setFromInternalNavigation] = useState(false);

  useLayoutEffect(() => {
    setFromInternalNavigation(sessionStorage.getItem(RELEASE_FROM_INTERNAL_NAV_STORAGE_KEY) === "1");
  }, []);

  return (
    <header className="fixed left-0 right-0 top-0 z-20 px-6 py-10 md:left-0 md:right-0 md:top-0 md:px-12">
      <div className="relative mx-auto flex min-h-[2.5rem] w-full max-w-[100vw] items-center justify-center">
        <div className="absolute left-0 top-1/2 z-30 -translate-y-1/2 md:left-0">
          {fromInternalNavigation ? (
            <button
              type="button"
              className={controlClass}
              onClick={() => router.back()}
              aria-label="Close, return to previous page"
            >
              Close
            </button>
          ) : (
            <Link href="/club-eden" className={controlClass}>
              Club Eden
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
