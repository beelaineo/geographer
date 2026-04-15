import type { ReactNode } from "react";

import AboutNav from "../../components/AboutNav";

export default function AboutLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0">
      <AboutNav />
      <div className="pt-32 md:pt-0">{children}</div>
    </div>
  );
}
