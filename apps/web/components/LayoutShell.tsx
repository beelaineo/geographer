"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import Footer from "./Footer";
import Header from "./Header";
import { SiteSettingsProvider } from "./SiteSettingsProvider";
import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";

type LayoutShellProps = {
  children: ReactNode;
  siteSettings: SITE_SETTINGS_QUERYResult;
};

export default function LayoutShell({
  children,
  siteSettings
}: LayoutShellProps) {
  const pathname = usePathname();
  const shouldHideChrome =
    !!pathname &&
    (pathname.includes("/collections") || pathname.includes("/projects"));

  return (
    <SiteSettingsProvider siteSettings={siteSettings}>
      <div className="flex min-h-screen flex-col bg-white text-black">
        {!shouldHideChrome && <Header siteSettings={siteSettings} />}
        <main className="flex-1">{children}</main>
        {!shouldHideChrome && <Footer siteSettings={siteSettings} />}
      </div>
    </SiteSettingsProvider>
  );
}

