import { sql } from "@/lib/db";
import { Project } from "@/types";

export async function getProjects(): Promise<Project[]> {
  try {
    const projects = await sql`
      SELECT * FROM projects 
      ORDER BY created_at DESC
    `;
    return projects as Project[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
}

export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const [project] = await sql`
      SELECT * FROM projects 
      WHERE id = ${id}
    `;
    return project as Project || null;
  } catch (error) {
    console.error("Error fetching project:", error);
    return null;
  }
}

export async function createProject(data: {
  name: string;
  status: "Idea" | "In Progress" | "Done" | "On Hold";
  tech_stack: string[];
  description?: string;
  api_endpoint?: string;
  github_repo?: string;
  priority?: "Low" | "Medium" | "High" | "Critical";
  progress?: number;
  related_issues?: string[];
  related_tasks?: string[];
  tags?: string[];
  timeline?: string;
}): Promise<Project> {
  try {
    const [project] = await sql`
      INSERT INTO projects (
        name, status, tech_stack, description, created_at,
        api_endpoint, github_repo, priority, progress,
        related_issues, related_tasks, tags, timeline, workflow
      )
      VALUES (
        ${data.name},
        ${data.status},
        ${data.tech_stack},
        ${data.description || null},
        ${new Date().toISOString()},
        ${data.api_endpoint || null},
        ${data.github_repo || null},
        ${data.priority || 'Medium'},
        ${data.progress || 0},
        ${data.related_issues || []},
        ${data.related_tasks || []},
        ${data.tags || []},
        ${data.timeline || null},
        ${JSON.stringify([
      { id: "backlog", name: "Backlog", color: "gray", type: "backlog" },
      { id: "in-progress", name: "In Progress", color: "blue", type: "started" },
      { id: "review", name: "Review", color: "purple", type: "started" },
      { id: "done", name: "Done", color: "green", type: "completed" }
    ])}
      )
      RETURNING *
    `;
    return project as Project;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
}

export async function updateProject(
  id: string,
  data: {
    name?: string;
    status?: "Idea" | "In Progress" | "Done" | "On Hold";
    tech_stack?: string[];
    description?: string;
    api_endpoint?: string;
    github_repo?: string;
    priority?: "Low" | "Medium" | "High" | "Critical";
    progress?: number;
    related_issues?: string[];
    related_tasks?: string[];
    tags?: string[];
    timeline?: string;
    vercel_project_id?: string;
  }
): Promise<Project> {
  try {
    const [project] = await sql`
      UPDATE projects
      SET 
        name = COALESCE(${data.name || null}, name),
        status = COALESCE(${data.status || null}, status),
        tech_stack = COALESCE(${data.tech_stack || null}, tech_stack),
        description = COALESCE(${data.description || null}, description),
        api_endpoint = COALESCE(${data.api_endpoint || null}, api_endpoint),
        github_repo = COALESCE(${data.github_repo || null}, github_repo),
        priority = COALESCE(${data.priority || null}, priority),
        progress = COALESCE(${data.progress !== undefined ? data.progress : null}, progress),
        related_issues = COALESCE(${data.related_issues || null}, related_issues),
        related_tasks = COALESCE(${data.related_tasks || null}, related_tasks),
        tags = COALESCE(${data.tags || null}, tags),
        timeline = COALESCE(${data.timeline || null}, timeline),
        vercel_project_id = COALESCE(${data.vercel_project_id || null}, vercel_project_id)
      WHERE id = ${id}
      RETURNING *
    `;
    return project as Project;
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
}

export async function deleteProject(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM projects 
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error("Error deleting project:", error);
    throw error;
  }
}
