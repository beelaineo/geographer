"use client";

import Link from "next/link";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";
import Logotype from "./Logotype";

type FooterProps = {
  siteSettings: SITE_SETTINGS_QUERYResult | null;
};

export default function Footer({ siteSettings }: FooterProps) {
  const footerMenu = siteSettings?.footerMenu ?? [];
  return (
    <footer className="p-10 md:p-12 grid grid-cols-2">
      <div className="flex items-center justify-between">
        <Logotype />
        <nav className="flex flex-col gap-1">
          {footerMenu.map((item) => item && (
            <Link key={item._key} href={item.linkType === "internal" ? item.internalLink?.slug?.current ?? "/" : item.externalLink ?? "/"} className="leading-none transition hover:opacity-70 uppercase">
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex justify-end">
        <form
          className="flex items-end gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            // In a real implementation, handle mailing list signup here.
          }}
        >
          <input
            type="email"
            required
            placeholder="Email"
            className="border-0 border-b border-black focus:outline-none focus:border-black bg-transparent px-0 py-1"
          />
          <button
            type="submit"
            className="appearance-none bg-transparent border-0 p-0 m-0 cursor-pointer text-black hover:underline uppercase"
          >
            Sign Up
          </button>
        </form>
      </div>
    </footer>
  );
}

