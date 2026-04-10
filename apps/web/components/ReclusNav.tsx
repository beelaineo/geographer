"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "uppercase type-small-text transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ReclusNav() {
  const pathname = usePathname() ?? "";
  const onReclusIndex = pathname === "/reclus";
  const onGallery = pathname === "/reclus/gallery" || pathname.startsWith("/reclus/gallery/");
  const onIndex = pathname === "/reclus/index" || pathname.startsWith("/reclus/index/");

  return (
    <nav
      aria-label="Reclus sections"
      className="absolute left-1/2 top-32 z-10 flex w-max -translate-x-1/2 flex-col gap-1 md:left-5 md:top-24 md:translate-x-0 text-center md:text-left"
    >
      <Link
        href="/reclus"
        className={[linkClass, onReclusIndex ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        Reclus
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
