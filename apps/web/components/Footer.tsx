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
  const baseClasses = "p-6 md:p-12 w-full";
  return (
    <footer className={`${baseClasses}`}>
      <div className="flex items-center justify-center gap-4">
        <nav className="flex gap-4">
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
              className="font-bold tracking-wide leading-none transition hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="text-center">
          <span className="font-bold tracking-wide">© Geographer {new Date().getFullYear()}</span>
        </div>
      </div>
    </footer>
  );
}

