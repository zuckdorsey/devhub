import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

export interface Issue {
    id: string;
    title: string;
    description: string | null;
    status: "open" | "closed";
    priority: "Low" | "Medium" | "High" | "Critical";
    project_id: string | null;
    labels: string[];
    github_issue_number: number | null;
    github_issue_url: string | null;
    github_synced_at: string | null;
    created_at: string;
    updated_at: string;
    // Joined fields
    project_name?: string;
}

export async function getIssues(): Promise<Issue[]> {
    const result = await sql`
    SELECT 
      i.*,
      p.name as project_name
    FROM issues i
    LEFT JOIN projects p ON i.project_id = p.id
    ORDER BY i.created_at DESC
  `;
    return result as Issue[];
}

export async function getIssuesByProjectId(projectId: string): Promise<Issue[]> {
    const result = await sql`
    SELECT 
      i.*,
      p.name as project_name
    FROM issues i
    LEFT JOIN projects p ON i.project_id = p.id
    WHERE i.project_id = ${projectId}
    ORDER BY i.created_at DESC
  `;
    return result as Issue[];
}

export async function getIssueById(id: string): Promise<Issue | null> {
    const result = await sql`
    SELECT 
      i.*,
      p.name as project_name
    FROM issues i
    LEFT JOIN projects p ON i.project_id = p.id
    WHERE i.id = ${id}
  `;
    return (result[0] as Issue) ?? null;
}

export async function createIssue(data: {
    title: string;
    description?: string;
    status?: "open" | "closed";
    priority?: "Low" | "Medium" | "High" | "Critical";
    project_id?: string;
    labels?: string[];
    github_issue_number?: number;
    github_issue_url?: string;
}): Promise<Issue> {
    const result = await sql`
    INSERT INTO issues (
      title,
      description,
      status,
      priority,
      project_id,
      labels,
      github_issue_number,
      github_issue_url,
      github_synced_at
    ) VALUES (
      ${data.title},
      ${data.description || null},
      ${data.status || "open"},
      ${data.priority || "Medium"},
      ${data.project_id || null},
      ${data.labels || []},
      ${data.github_issue_number || null},
      ${data.github_issue_url || null},
      ${data.github_issue_number ? new Date().toISOString() : null}
    )
    RETURNING *
  `;
    return result[0] as Issue;
}

export async function updateIssue(
    id: string,
    data: {
        title?: string;
        description?: string | null;
        status?: "open" | "closed";
        priority?: "Low" | "Medium" | "High" | "Critical";
        project_id?: string | null;
        labels?: string[];
        github_issue_number?: number | null;
        github_issue_url?: string | null;
        github_synced_at?: string | null;
    }
): Promise<Issue> {
    const result = await sql`
    UPDATE issues SET
      title = ${data.title !== undefined ? data.title : sql`title`},
      description = ${data.description !== undefined ? data.description : sql`description`},
      status = ${data.status !== undefined ? data.status : sql`status`},
      priority = ${data.priority !== undefined ? data.priority : sql`priority`},
      project_id = ${data.project_id !== undefined ? data.project_id : sql`project_id`},
      labels = ${data.labels !== undefined ? data.labels : sql`labels`},
      github_issue_number = ${data.github_issue_number !== undefined ? data.github_issue_number : sql`github_issue_number`},
      github_issue_url = ${data.github_issue_url !== undefined ? data.github_issue_url : sql`github_issue_url`},
      github_synced_at = ${data.github_synced_at !== undefined ? data.github_synced_at : sql`github_synced_at`},
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
    return result[0] as Issue;
}

export async function deleteIssue(id: string): Promise<void> {
    await sql`DELETE FROM issues WHERE id = ${id}`;
}

// Sync local issue to GitHub
export async function markIssueAsSynced(
    id: string,
    github_issue_number: number,
    github_issue_url: string
): Promise<Issue> {
    const result = await sql`
    UPDATE issues SET
      github_issue_number = ${github_issue_number},
      github_issue_url = ${github_issue_url},
      github_synced_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ${id}
    RETURNING *
  `;
    return result[0] as Issue;
}

// Import a GitHub issue as local issue
export async function importGitHubIssue(data: {
    title: string;
    description?: string;
    status: "open" | "closed";
    project_id: string;
    github_issue_number: number;
    github_issue_url: string;
    labels?: string[];
}): Promise<Issue> {
    // Check if already imported
    const existing = await sql`
    SELECT id FROM issues 
    WHERE project_id = ${data.project_id} 
    AND github_issue_number = ${data.github_issue_number}
  `;

    if (existing.length > 0) {
        // Update existing
        return updateIssue(existing[0].id as string, {
            title: data.title,
            description: data.description,
            status: data.status,
            labels: data.labels,
        });
    }

    // Create new
    return createIssue({
        title: data.title,
        description: data.description,
        status: data.status,
        project_id: data.project_id,
        labels: data.labels,
        github_issue_number: data.github_issue_number,
        github_issue_url: data.github_issue_url,
    });
}
