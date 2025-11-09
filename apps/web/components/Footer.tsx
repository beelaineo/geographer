"use client";

import Link from "next/link";

import { resolveProductionUrl } from "../lib/resolveProductionUrl";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import Logotype from "./Logotype";
import { SignUpForm } from "./SignUpForm";
type FooterProps = {
  siteSettings: SITE_SETTINGS_QUERYResult | null;
};

export default function Footer({ siteSettings }: FooterProps) {
  const footerMenu = siteSettings?.footerMenu ?? [];
  return (
    <footer className="p-6 md:p-12 grid md:grid-cols-2 fixed bottom-0 left-0 w-full z-10">
      <div className="flex items-center justify-between">
        <Link href="/">
          <Logotype className="h-6 md:h-8 w-auto" />
        </Link>
        <nav className="flex flex-col gap-1">
          {footerMenu.map(
            (item) =>
              item && (
                <Link
                  key={item._key}
                  href={
                    item.linkType === "internal"
                      ? resolveProductionUrl(item.internalLink)
                      : item.externalLink ?? "/"
                  }
                  className="leading-none transition hover:opacity-70 uppercase"
                >
                  {item.label}
                </Link>
              )
          )}
        </nav>
      </div>
      <div className="flex justify-end">
        <SignUpForm />
      </div>
    </footer>
  );
}

