import type { ReactNode } from "react";

import ClubEdenNav from "../../components/ClubEdenNav";

export default function ClubEdenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0">
      <ClubEdenNav />
      <div className="pt-32 md:pt-0">{children}</div>
    </div>
  );
}
