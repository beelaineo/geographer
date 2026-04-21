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
  const footerMenu = (siteSettings?.footerMenu ?? []).filter(
    (item): item is NonNullable<typeof item> => Boolean(item)
  );
  const baseClasses = "p-5 md:p-10 w-full";
  return (
    <footer className={`${baseClasses}`}>
      <div className="flex flex-col md:flex-row items-center justify-center gap-5">
        <nav className="flex gap-5">
          {footerMenu.map((item, index) => (
            <Link
              key={item._key ?? `${item.label ?? "footer-item"}-${index}`}
              target={item.linkType === "external" ? "_blank" : undefined}
              rel={item.linkType === "external" ? "noopener noreferrer" : undefined}
              href={
                item.linkType === "internal"
                  ? resolveProductionUrl(item.internalLink)
                  : item.externalLink ?? "/"
              }
              className="type-small-text transition hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-col items-center justify-center">
          <span className="type-small-text"><span className="inline-block translate-y-[2px]">©</span> Geographer {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

