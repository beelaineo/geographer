import type { ReactNode } from "react";

import AboutNav from "../../components/AboutNav";

export default function ContributorsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0">
      <AboutNav />
      {children}
    </div>
  );
}
