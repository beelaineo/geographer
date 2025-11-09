import Link from "next/link";
import { draftMode } from "next/headers";

import {
  PROJECTS_QUERY,
  type PROJECTS_QUERYResult
} from "../../lib/queries";
import { getClient } from "../../lib/sanity.client";

export const revalidate = 180;

async function loadProjects(previewEnabled: boolean) {
  const client = getClient({ preview: previewEnabled });
  return client.fetch<PROJECTS_QUERYResult>(PROJECTS_QUERY);
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

