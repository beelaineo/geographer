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
  const isCollectionsOrProjects =
    !!pathname && (pathname.includes("/collections") || pathname.includes("/projects"));
  const isAboutPage = pathname === "/about";

  return (
    <SiteSettingsProvider siteSettings={siteSettings}>
      <div className="flex min-h-screen flex-col bg-white text-black">
        {!isCollectionsOrProjects && (
          <Header
            siteSettings={siteSettings}
            isFixedMobile={!isAboutPage}
            isFixedDesktop
          />
        )}
        <main className="flex-1">{children}</main>
        <Footer
          siteSettings={siteSettings}
          isFixedMobile={!isCollectionsOrProjects && !isAboutPage}
          isFixedDesktop={!isCollectionsOrProjects}
        />
      </div>
    </SiteSettingsProvider>
  );
}

