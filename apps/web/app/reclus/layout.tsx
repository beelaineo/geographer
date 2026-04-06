import type { ReactNode } from "react";

import ReclusNav from "../../components/ReclusNav";

export default function ReclusLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-0">
      <ReclusNav />
      <div>{children}</div>
    </div>
  );
}
