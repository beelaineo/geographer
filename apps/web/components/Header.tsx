"use client";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import Link from "next/link";

type HeaderProps = {
  siteSettings: SITE_SETTINGS_QUERYResult | null;
};

export default function Header({ siteSettings }: HeaderProps) {
  const mainMenu = siteSettings?.mainMenu ?? [];
  console.log(mainMenu);
  return (
    <header className="">
      <div className="text-xl">
        {mainMenu.map((item) => item && (
          <Link key={item._key} href={item.linkType === "internal" ? item.internalLink?.slug?.current ?? "/" : item.externalLink ?? "/"} className="transition hover:opacity-70">
            {item.label}
          </Link>
        ))}
      </div>
    </header>
  );
}

