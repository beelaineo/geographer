"use client";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import Link from "next/link";

import { resolveProductionUrl } from "../lib/resolveProductionUrl";

type HeaderProps = {
  siteSettings: SITE_SETTINGS_QUERYResult | null;
};

export default function Header({ siteSettings }: HeaderProps) {
  const mainMenu = siteSettings?.mainMenu ?? [];
  console.log(mainMenu);
  return (
    <header className="fixed top-0 left-0 w-full z-10 p-6 md:p-12 flex justify-center items-center">
      <nav className="text-2xl flex flex-col md:flex-row items-center gap-2 md:gap-8">
        {mainMenu.map(
          (item) =>
            item && (
              <Link
                key={item._key}
                href={
                  item.linkType === "internal"
                    ? resolveProductionUrl(item.internalLink)
                    : item.externalLink ?? "/"
                }
                className="transition hover:opacity-70"
              >
                {item.label}
              </Link>
            )
        )}
      </nav>
    </header>
  );
}

