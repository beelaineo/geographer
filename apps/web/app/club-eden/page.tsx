import { permanentRedirect } from "next/navigation";

export default async function LegacyClubEdenPage() {
  permanentRedirect("/clubeden");
}
