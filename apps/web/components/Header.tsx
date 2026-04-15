"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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
  const [isDesktopLogotypeHidden, setIsDesktopLogotypeHidden] = useState(false);
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

  useEffect(() => {
    const handleViewportChange = () => {
      if (window.innerWidth < 768) {
        setIsDesktopLogotypeHidden(false);
        return;
      }

      setIsDesktopLogotypeHidden(window.scrollY > window.innerHeight * 0.5);
    };

    handleViewportChange();

    window.addEventListener("scroll", handleViewportChange, { passive: true });
    window.addEventListener("resize", handleViewportChange);

    return () => {
      window.removeEventListener("scroll", handleViewportChange);
      window.removeEventListener("resize", handleViewportChange);
    };
  }, []);

  return (
    <header
      className={`${mobilePositionClasses} ${desktopPositionClasses} px-5 py-5 md:px-5 md:py-5`}
    >
      <div className="relative mx-auto flex min-h-[2.5rem] w-full max-w-[100vw] items-center justify-center">
        <div className="absolute left-1/2 top-16 z-30 mt-4 -translate-x-1/2 md:left-0 md:top-0 md:mt-0 md:-translate-x-0">
          <HeaderMenu items={mainMenu} />
        </div>
        <Link
          href="/"
          className={`relative z-0 block max-w-[640px] px-16 text-center transition-opacity duration-300 md:hover:opacity-100 ${
            isDesktopLogotypeHidden ? "md:opacity-0" : "md:opacity-100"
          }`}
        >
          <Logotype className="mx-auto h-8 w-auto" />
        </Link>
      </div>
    </header>
  );
}
