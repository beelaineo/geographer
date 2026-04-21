"use client";

import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";

import {
  INTERVIEW_FROM_INTERNAL_NAV_STORAGE_KEY,
  RELEASE_FROM_INTERNAL_NAV_STORAGE_KEY
} from "../lib/releaseNavigation";
import { colorToCss } from "../lib/sanityColor";
import Footer from "./Footer";
import Header from "./Header";
import InterviewCloseBar from "./InterviewCloseBar";
import NewsletterCloseBar from "./NewsletterCloseBar";
import ReleaseCloseBar from "./ReleaseCloseBar";
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
  const prevPathnameRef = useRef<string | null>(null);

  useLayoutEffect(() => {
    const prev = prevPathnameRef.current;
    const current = pathname ?? "";

    if (current.includes("releases")) {
      if (prev != null && !prev.includes("releases")) {
        sessionStorage.setItem(RELEASE_FROM_INTERNAL_NAV_STORAGE_KEY, "1");
      } else if (prev == null) {
        sessionStorage.removeItem(RELEASE_FROM_INTERNAL_NAV_STORAGE_KEY);
      }
    }

    if (current.startsWith("/interviews/")) {
      if (prev != null && !prev.startsWith("/interviews/")) {
        sessionStorage.setItem(INTERVIEW_FROM_INTERNAL_NAV_STORAGE_KEY, "1");
      } else if (prev == null) {
        sessionStorage.removeItem(INTERVIEW_FROM_INTERNAL_NAV_STORAGE_KEY);
      }
    }

    prevPathnameRef.current = current;
  }, [pathname]);

  const isCollectionsOrProjects =
    !!pathname && (pathname.includes("/collections") || pathname.includes("/projects"));
  const isAboutPage = pathname === "/about";
  const isReleasesRoute = !!pathname && pathname.includes("releases");
  const isInterviewDetailRoute = !!pathname && pathname.startsWith("/interviews/");
  const isNewsletterRoute = pathname === "/newsletter";
  const isOverlayRoute = isReleasesRoute || isNewsletterRoute;
  const hideSiteChrome = isOverlayRoute || isInterviewDetailRoute;
  const overlayBackgroundColor = colorToCss(siteSettings?.overlayBGColor) ?? "#b0b3b2";

  useEffect(() => {
    document.documentElement.classList.toggle("releases-route", isOverlayRoute);
    return () => {
      document.documentElement.classList.remove("releases-route");
    };
  }, [isOverlayRoute]);

  return (
    <SiteSettingsProvider siteSettings={siteSettings}>
      <div
        className={`flex min-h-screen flex-col text-black ${isOverlayRoute ? "" : "bg-white"}`}
        style={isOverlayRoute ? { backgroundColor: overlayBackgroundColor } : undefined}
      >
        {!isCollectionsOrProjects && !hideSiteChrome && (
          <Header
            siteSettings={siteSettings}
            isFixedMobile={!isAboutPage}
            isFixedDesktop
          />
        )}
        {isReleasesRoute ? <ReleaseCloseBar /> : null}
        {isNewsletterRoute ? <NewsletterCloseBar /> : null}
        {isInterviewDetailRoute ? <InterviewCloseBar /> : null}
        <main className="flex-1">{children}</main>
        {!hideSiteChrome ? (
          <Footer
            siteSettings={siteSettings}
            isFixedMobile={!isCollectionsOrProjects && !isAboutPage}
            isFixedDesktop={!isCollectionsOrProjects}
          />
        ) : null}
      </div>
    </SiteSettingsProvider>
  );
}

