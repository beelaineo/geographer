import { permanentRedirect } from "next/navigation";

type LegacyClubEdenCollectionPageProps = {
  params: Promise<{ collectionSlug: string }>;
};

export default async function LegacyClubEdenCollectionPage({ params }: LegacyClubEdenCollectionPageProps) {
  const { collectionSlug } = await params;
  permanentRedirect(`/clubeden/${collectionSlug}`);
}
