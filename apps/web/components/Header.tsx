"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import { resolveProductionUrl } from "../lib/resolveProductionUrl";

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
  const mobilePositionClasses = shouldFixMobile ? "fixed top-0 left-0 w-full z-10" : "relative";
  const desktopPositionClasses = shouldFixDesktop
    ? "md:fixed md:top-0 md:left-0 md:w-full md:z-10"
    : "md:relative";

  return (
    <header
      className={`${mobilePositionClasses} ${desktopPositionClasses} p-6 md:p-12 flex justify-center items-center`}
    >
      <nav className="text-2xl flex flex-col md:flex-row items-center gap-2 md:gap-8">
        {mainMenu.map((item, index) => (
          <Link
            key={item._key ?? `${item.label ?? "menu-item"}-${index}`}
            href={
              item.linkType === "internal"
                ? resolveProductionUrl(item.internalLink)
                : item.externalLink ?? "/"
            }
            className="transition hover:opacity-70"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}

