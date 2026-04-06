"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "uppercase tracking-wide font-bold transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function ClubEdenNav() {
  const pathname = usePathname() ?? "";
  const onClubEdenIndex = pathname === "/club-eden";
  const onOrigins = pathname.startsWith("/club-eden/origins");
  const on1992 = pathname.startsWith("/club-eden/1992");

  return (
    <nav
      aria-label="Club Eden sections"
      className="absolute left-6 top-28 z-10 flex w-max flex-col md:left-12 md:top-32"
    >
      <Link
        href="/club-eden"
        className={[linkClass, onClubEdenIndex ? "underline underline-offset-4" : ""].filter(Boolean).join(" ")}
      >
        Club Eden
      </Link>
      <div className="min-h-4 shrink-0 md:min-h-6" aria-hidden />
      <Link
        href="/club-eden/origins"
        className={[linkClass, onOrigins ? "underline underline-offset-4" : ""].filter(Boolean).join(" ")}
      >
        Origins
      </Link>
      <Link
        href="/club-eden/1992"
        className={[linkClass, on1992 ? "underline underline-offset-4" : ""].filter(Boolean).join(" ")}
      >
        1992
      </Link>
    </nav>
  );
}
