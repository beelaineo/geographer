import type { Metadata } from "next";
import Link from "next/link";
import { draftMode } from "next/headers";

import {
  PROJECTS_QUERY,
  type PROJECTS_QUERYResult
} from "../../lib/queries";
import { fetchSiteSettings } from "../../lib/siteSettings";
import { fetchSanityQuery } from "../../lib/sanity.fetch";
import { buildMetadata, type SanitySeoPayload } from "../../lib/seo";

async function loadProjects(previewEnabled: boolean) {
  return fetchSanityQuery<PROJECTS_QUERYResult>(PROJECTS_QUERY, {
    tags: ["sanity:project:list"],
    preview: previewEnabled
  });
}

export async function generateMetadata(): Promise<Metadata> {
  const { isEnabled } = await draftMode();
  const siteSettings = await fetchSiteSettings(isEnabled);
  const siteSeo = siteSettings?.seo as SanitySeoPayload;

  return buildMetadata({
    siteSeo,
    title: "Projects"
  });
}

export default async function ProjectsPage() {
  const { isEnabled } = await draftMode();
  const projects = (await loadProjects(isEnabled)) ?? [];

  return (
    <main>
      <h1>Projects</h1>
      {projects.length ? (
        <ul>
          {projects.map((project) => {
            const slug = project?.slug?.current;
            const href = slug ? `/projects/${slug}` : "#";

            return (
              <li key={project?._id ?? slug}>
                <Link href={href}>{project?.title ?? "Untitled project"}</Link>
                {project?.location ? <span> – {project.location}</span> : null}
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No projects available.</p>
      )}
    </main>
  );
}

