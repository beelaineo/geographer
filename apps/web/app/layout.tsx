import type { Metadata } from "next";
import { draftMode } from "next/headers";
import type { ReactNode } from "react";
import localFont from "next/font/local";

import "./globals.css";
import LayoutShell from "../components/LayoutShell";
import { fetchSiteSettings } from "../lib/siteSettings";
import { buildMetadata } from "../lib/seo";
import { urlForImageWithWidth } from "../lib/sanityImage";

const u001 = localFont({
  src: [
    {
      path: "../assets/fonts/u001-reg.woff2",
      weight: "400",
      style: "normal"
    },
    {
      path: "../assets/fonts/u001-ita.woff2",
      weight: "400",
      style: "italic"
    },
    {
      path: "../assets/fonts/u001-bol.woff2",
      weight: "700",
      style: "normal"
    },
    {
      path: "../assets/fonts/u001-bolita.woff2",
      weight: "700",
      style: "italic"
    },
  ],
  variable: "--font-u001",
  display: "swap",
  adjustFontFallback: "Arial"
});

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
  const favicon = (siteSettings as typeof siteSettings & {
    favicon?: { asset?: unknown } | null;
  })?.favicon;
  const faviconUrl =
    favicon?.asset ? urlForImageWithWidth(favicon, 64).fit("crop").url() : undefined;

  const metadata = buildMetadata({
    siteSeo: siteSettings?.seo,
    title: "Geographer"
  });

  return {
    ...metadata,
    icons: faviconUrl
      ? {
          icon: [{ url: faviconUrl }],
          shortcut: [faviconUrl],
          apple: [{ url: faviconUrl }]
        }
      : metadata.icons
  };
}

export default async function RootLayout({
  children
}: {
  children: ReactNode;
}) {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);

  return (
    <html lang="en" className={`${junicode.variable} ${u001.variable}`}>
      <body className="font-sans antialiased">
        <LayoutShell siteSettings={siteSettings}>{children}</LayoutShell>
      </body>
    </html>
  );
}
