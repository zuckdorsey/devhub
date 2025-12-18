import { sql } from "@/lib/db";
import type { Task } from "@/lib/tasks";

export interface TaskBranchLink {
  id: string;
  task_id: string;
  repo_full_name: string;
  branch_name: string;
  source: "auto" | "manual";
  created_at: string;
}

export async function linkTaskToBranch(
  taskId: string,
  repoFullName: string,
  branchName: string,
  source: "auto" | "manual" = "manual"
): Promise<TaskBranchLink> {
  const [row] = await sql<TaskBranchLink[]>`
    INSERT INTO task_branch_links (task_id, repo_full_name, branch_name, source)
    VALUES (${taskId}, ${repoFullName}, ${branchName}, ${source})
    ON CONFLICT (task_id, repo_full_name, branch_name) DO UPDATE
      SET source = EXCLUDED.source
    RETURNING *
  `;

  return row;
}

export async function unlinkTaskFromBranch(
  taskId: string,
  repoFullName: string,
  branchName: string
): Promise<void> {
  await sql`
    DELETE FROM task_branch_links
    WHERE task_id = ${taskId}
      AND repo_full_name = ${repoFullName}
      AND branch_name = ${branchName}
  `;
}

export async function getBranchesForTask(taskId: string): Promise<TaskBranchLink[]> {
  const rows = await sql<TaskBranchLink[]>`
    SELECT *
    FROM task_branch_links
    WHERE task_id = ${taskId}
    ORDER BY created_at DESC
  `;

  return rows;
}

export async function getTasksForBranch(
  projectId: string,
  repoFullName: string,
  branchName: string
): Promise<Task[]> {
  const rows = await sql<Task[]>`
    SELECT t.*
    FROM task_branch_links l
    JOIN tasks t ON t.id = l.task_id
    WHERE l.repo_full_name = ${repoFullName}
      AND l.branch_name = ${branchName}
      AND t.project_id = ${projectId}
  `;

  return rows;
}
