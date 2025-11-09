import type { Metadata } from "next";
import { draftMode } from "next/headers";
import type { ReactNode } from "react";
import localFont from "next/font/local";

import "./globals.css";
import LayoutShell from "../components/LayoutShell";
import { fetchSiteSettings } from "../lib/siteSettings";
import { buildMetadata } from "../lib/seo";

const junicode = localFont({
  src: [
    {
      path: "../assets/fonts/JunicodeVF-Roman.woff2",
      weight: "100 900",
      style: "normal"
    },
    {
      path: "../assets/fonts/JunicodeVF-Italic.woff2",
      weight: "100 900",
      style: "italic"
    }
  ],
  variable: "--font-junicode",
  display: "swap",
  adjustFontFallback: "Times New Roman"
});

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);

  return buildMetadata({
    siteSeo: siteSettings?.seo,
    title: "Geographer"
  });
}

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);

  return (
    <html lang="en" className={junicode.variable}>
      <body className="font-serif antialiased">
        <LayoutShell siteSettings={siteSettings}>{children}</LayoutShell>
      </body>
    </html>
  );
}
