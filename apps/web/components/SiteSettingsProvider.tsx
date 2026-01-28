"use client";

import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type { SITE_SETTINGS_QUERYResult } from "../types/sanity.generated";

type SiteSettingsContextValue = SITE_SETTINGS_QUERYResult;

const SiteSettingsContext = createContext<SiteSettingsContextValue>(null);

type SiteSettingsProviderProps = {
  siteSettings: SiteSettingsContextValue;
  children: ReactNode;
};

export function SiteSettingsProvider({
  siteSettings,
  children
}: SiteSettingsProviderProps) {
  return (
    <SiteSettingsContext.Provider value={siteSettings}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  return useContext(SiteSettingsContext);
}





