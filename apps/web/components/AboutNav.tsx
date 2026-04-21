"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const linkClass =
  "uppercase type-body-sans transition hover:opacity-70 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2";

export default function AboutNav() {
  const pathname = usePathname() ?? "";
  const onAbout = pathname === "/about";
  const onContributors = pathname === "/contributors";
  const onContact = pathname === "/pages/contact";

  return (
    <nav
      aria-label="About sections"
      className="absolute left-1/2 top-36 z-10 flex w-max -translate-x-1/2 flex-col gap-1 text-center md:left-5 md:top-[115px] md:translate-x-0 md:text-left"
    >
      <Link
        href="/about"
        className={[linkClass, onAbout ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        About
      </Link>
      <Link
        href="/contributors"
        className={[linkClass, onContributors ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        Contributors
      </Link>
      <Link
        href="/pages/contact"
        className={[linkClass, onContact ? "underline underline-offset-2" : ""].filter(Boolean).join(" ")}
      >
        Contact
      </Link>
    </nav>
  );
}
