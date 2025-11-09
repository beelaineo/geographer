"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { resolveProductionUrl } from "../lib/resolveProductionUrl";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import Logotype from "./Logotype";
import { SignUpForm } from "./SignUpForm";
type FooterProps = {
  siteSettings: SITE_SETTINGS_QUERYResult | null;
  isFixedMobile?: boolean;
  isFixedDesktop?: boolean;
};

export default function Footer({
  siteSettings,
  isFixedMobile = true,
  isFixedDesktop = true
}: FooterProps) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const shouldFixMobile = isHomePage || isFixedMobile;
  const shouldFixDesktop = isHomePage || isFixedDesktop;
  const footerMenu = (siteSettings?.footerMenu ?? []).filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );
  const baseClasses = "p-6 md:p-12 grid md:grid-cols-2 w-full";
  const mobilePositionClasses = shouldFixMobile ? "fixed bottom-0 left-0 z-10" : "relative";
  const desktopPositionClasses = shouldFixDesktop
    ? "md:fixed md:bottom-0 md:left-0 md:z-10"
    : "md:relative";
  return (
    <footer className={`${baseClasses} ${mobilePositionClasses} ${desktopPositionClasses}`}>
      <div className="flex items-center justify-between">
        <Link href="/">
          <Logotype className="h-6 md:h-8 w-auto" />
        </Link>
        <nav className="flex flex-col gap-1">
          {footerMenu.map((item, index) => (
            <Link
              key={item._key ?? `${item.label ?? "footer-item"}-${index}`}
              href={
                item.linkType === "internal"
                  ? resolveProductionUrl(item.internalLink)
                  : item.externalLink ?? "/"
              }
              className="text-xs sm:text-sm leading-none transition hover:opacity-70 uppercase"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="hidden md:flex justify-end">
        <SignUpForm />
      </div>
    </footer>
  );
}

