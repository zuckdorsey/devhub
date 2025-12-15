import { sql } from "@/lib/db";

export interface ProjectVersion {
    id: string;
    project_id: string;
    name: string;
    description: string | null;
    created_at: string;
}

export interface ProjectVersionTaskSnapshot {
    id: string;
    project_version_id: string;
    task_id: string;
    project_id: string | null;
    section_id: string | null;
    title: string;
    description: string | null;
    status: string;
    priority: string;
    start_time: string | null;
    due_date: string | null;
}

export async function createProjectVersion(
    projectId: string,
    name: string,
    description?: string
): Promise<ProjectVersion> {
    // 1. Create version row
    const [version] = await sql`
      INSERT INTO project_versions (project_id, name, description)
      VALUES (${projectId}, ${name}, ${description || null})
      RETURNING *
    `;

    const versionId = (version as ProjectVersion).id;

    // 2. Snapshot current tasks for this project at creation time
    await sql`
      INSERT INTO project_version_tasks (
        project_version_id,
        task_id,
        project_id,
        section_id,
        title,
        description,
        status,
        priority,
        start_time,
        due_date
      )
      SELECT
        ${versionId} AS project_version_id,
        t.id,
        t.project_id,
        t.section_id,
        t.title,
        t.description,
        t.status,
        t.priority,
        t.start_time,
        t.due_date
      FROM tasks t
      WHERE t.project_id = ${projectId}
    `;

    return version as ProjectVersion;
}

export async function getProjectVersions(projectId: string): Promise<ProjectVersion[]> {
    const versions = await sql`
      SELECT *
      FROM project_versions
      WHERE project_id = ${projectId}
      ORDER BY created_at DESC
    `;
    return versions as ProjectVersion[];
}

export async function getProjectVersionById(id: string): Promise<ProjectVersion | null> {
    const [version] = await sql`
      SELECT * FROM project_versions WHERE id = ${id}
    `;
    return (version as ProjectVersion) || null;
}

export async function getProjectVersionTasks(versionId: string): Promise<ProjectVersionTaskSnapshot[]> {
    const tasks = await sql`
      SELECT *
      FROM project_version_tasks
      WHERE project_version_id = ${versionId}
      ORDER BY title ASC
    `;
    return tasks as ProjectVersionTaskSnapshot[];
}
