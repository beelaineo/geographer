import { permanentRedirect } from "next/navigation";

type InterviewRedirectPageProps = {
  params: Promise<{ interviewSlug: string }>;
};

export default async function InterviewRedirectPage({ params }: InterviewRedirectPageProps) {
  const { interviewSlug } = await params;
  permanentRedirect(`/reclus/${interviewSlug}`);
}
