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
  start_date?: string;
  end_date?: string;
  image_url?: string;
  documentation_links?: string[];
  vercel_project_id?: string;
}): Promise<Project> {
  try {
    const [project] = await sql`
      INSERT INTO projects (
        name, status, tech_stack, description, created_at,
        api_endpoint, github_repo, priority, progress,
        related_issues, related_tasks, tags, start_date, end_date,
        image_url, documentation_links, vercel_project_id, workflow
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
        ${data.start_date || null},
        ${data.end_date || null},
        ${data.image_url || null},
        ${data.documentation_links || []},
        ${data.vercel_project_id || null},
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
    start_date?: string;
    end_date?: string;
    image_url?: string;
    documentation_links?: string[];
    vercel_project_id?: string;
  }
): Promise<Project> {
  try {
    const [project] = await sql`
      UPDATE projects
      SET 
        name = ${data.name !== undefined ? data.name : sql`name`},
        status = ${data.status !== undefined ? data.status : sql`status`},
        tech_stack = ${data.tech_stack !== undefined ? data.tech_stack : sql`tech_stack`},
        description = ${data.description !== undefined ? data.description : sql`description`},
        api_endpoint = ${data.api_endpoint !== undefined ? data.api_endpoint : sql`api_endpoint`},
        github_repo = ${data.github_repo !== undefined ? data.github_repo : sql`github_repo`},
        priority = ${data.priority !== undefined ? data.priority : sql`priority`},
        progress = ${data.progress !== undefined ? data.progress : sql`progress`},
        related_issues = ${data.related_issues !== undefined ? data.related_issues : sql`related_issues`},
        related_tasks = ${data.related_tasks !== undefined ? data.related_tasks : sql`related_tasks`},
        tags = ${data.tags !== undefined ? data.tags : sql`tags`},
        start_date = ${data.start_date !== undefined ? data.start_date : sql`start_date`},
        end_date = ${data.end_date !== undefined ? data.end_date : sql`end_date`},
        image_url = ${data.image_url !== undefined ? data.image_url : sql`image_url`},
        documentation_links = ${data.documentation_links !== undefined ? data.documentation_links : sql`documentation_links`},
        vercel_project_id = ${data.vercel_project_id !== undefined ? data.vercel_project_id : sql`vercel_project_id`}
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
