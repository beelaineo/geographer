"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import HeaderMenu from "./HeaderMenu";
import Logotype from "./Logotype";

type HeaderProps = {
  siteSettings: SITE_SETTINGS_QUERYResult | null;
  isFixedMobile?: boolean;
  isFixedDesktop?: boolean;
};

export default function Header({
  siteSettings,
  isFixedMobile = true,
  isFixedDesktop = true
}: HeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const shouldFixMobile = isHomePage || isFixedMobile;
  const shouldFixDesktop = isHomePage || isFixedDesktop;
  const mainMenu = (siteSettings?.mainMenu ?? []).filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );
  const mobilePositionClasses = shouldFixMobile ? "fixed top-0 left-0 right-0 z-20" : "relative";
  const desktopPositionClasses = shouldFixDesktop
    ? "md:fixed md:top-0 md:left-0 md:right-0 md:z-20"
    : "md:relative";

  const logotypeText = siteSettings?.seo?.title?.trim() || "Geographer";

  return (
    <header
      className={`${mobilePositionClasses} ${desktopPositionClasses} px-6 py-10 md:px-12`}
    >
      <div className="relative mx-auto flex min-h-[2.5rem] w-full max-w-[100vw] items-center justify-center">
        <div className="absolute left-0 top-1/2 z-30 -translate-y-1/2 md:left-0">
          <HeaderMenu items={mainMenu} />
        </div>
        <Link
          href="/"
          className="relative z-0 block max-w-[640px] px-16 text-center transition"
        >
          <Logotype className="mx-auto h-10 w-auto" />
        </Link>
      </div>
    </header>
  );
}
