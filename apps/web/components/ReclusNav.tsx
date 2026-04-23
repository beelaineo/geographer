"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "uppercase type-body-sans transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

function isReclusInterviewDetailPath(pathname: string): boolean {
  if (!pathname.startsWith("/reclus/")) {
    return false;
  }

  const segment = pathname.slice("/reclus/".length).split("/")[0];
  return Boolean(segment) && segment !== "gallery" && segment !== "index";
}

export default function ReclusNav() {
  const pathname = usePathname() ?? "";
  const onReclusIndex = pathname === "/reclus";
  const onGallery = pathname === "/reclus/gallery" || pathname.startsWith("/reclus/gallery/");
  const onIndex = pathname === "/reclus/index" || pathname.startsWith("/reclus/index/");
  const hideOnInterviewDetail = isReclusInterviewDetailPath(pathname);

  if (hideOnInterviewDetail) {
    return null;
  }

  return (
    <nav
      aria-label="Reclus sections"
      className="absolute left-1/2 top-36 z-10 flex w-max -translate-x-1/2 flex-col gap-1 md:left-5 md:top-[115px] md:translate-x-0 text-center md:text-left"
    >
      <Link
        href="/reclus"
        className={[linkClass, onReclusIndex ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        Interviews
      </Link>
      <div className="min-h-3 shrink-0 md:min-h-4" aria-hidden />
      <Link
        href="/reclus/gallery"
        className={[linkClass, onGallery ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        Gallery
      </Link>
      <Link
        href="/reclus/index"
        className={[linkClass, onIndex ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        Index
      </Link>
    </nav>
  );
}
