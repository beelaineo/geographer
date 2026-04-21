import type { ReactNode } from "react";

import AboutNav from "../../../components/AboutNav";

type StaticPageLayoutProps = {
  children: ReactNode;
  params: Promise<{ slug: string }>;
};

export default async function StaticPageLayout({ children, params }: StaticPageLayoutProps) {
  const { slug } = await params;
  const showAboutNav = slug === "contact";

  if (!showAboutNav) {
    return children;
  }

  return (
    <div className="relative min-h-screen">
      <AboutNav />
      {children}
    </div>
  );
}
