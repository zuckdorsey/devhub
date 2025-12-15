import { sql } from "@/lib/db";
import type { Task } from "@/lib/tasks";
import type { ProjectVersion } from "@/lib/projectVersions";
import type { GitHubCommit } from "@/lib/github";

export interface TaskCommitLink {
  id: string;
  task_id: string;
  commit_sha: string;
  repo_full_name: string;
  source: "auto" | "manual";
  created_at: string;
}

export interface ProjectVersionCommitLink {
  id: string;
  project_version_id: string;
  commit_sha: string;
  repo_full_name: string;
  created_at: string;
}

export interface CommitRelations {
  tasksBySha: Record<string, Task[]>;
  versionsBySha: Record<string, ProjectVersion[]>;
  repoFullName: string | null;
}

function getRepoFullNameFromUrl(repoUrl: string): string | null {
  try {
    const parsed = new URL(repoUrl);
    const parts = parsed.pathname.split("/").filter(Boolean);
    if (parts.length >= 2) {
      return `${parts[0]}/${parts[1]}`;
    }
  } catch (e) {
    // ignore invalid URL
  }
  return null;
}

function parseTaskReferenceNumbers(message: string): number[] {
  const refs = new Set<number>();
  const patterns = [/#TASK-(\d+)/gi, /task:(\d+)/gi];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(message))) {
      const value = parseInt(match[1], 10);
      if (!Number.isNaN(value)) {
        refs.add(value);
      }
    }
  }

  return Array.from(refs);
}

async function getTasksByGithubIssueNumbers(
  projectId: string,
  issueNumbers: number[]
): Promise<Task[]> {
  if (issueNumbers.length === 0) return [];

  const rows = await sql<Task[]>`
    SELECT *
    FROM tasks
    WHERE project_id = ${projectId}
      AND github_issue_number = ANY(${issueNumbers})
  `;

  return rows;
}

export async function autoLinkCommitToTasks(
  projectId: string,
  repoFullName: string,
  commit: GitHubCommit
): Promise<Task[]> {
  const message = commit.commit?.message || "";
  const refs = parseTaskReferenceNumbers(message);
  if (refs.length === 0) return [];

  const tasks = await getTasksByGithubIssueNumbers(projectId, refs);
  if (tasks.length === 0) return [];

  for (const task of tasks) {
    await sql`
      INSERT INTO task_commit_links (task_id, commit_sha, repo_full_name, source)
      VALUES (${task.id}, ${commit.sha}, ${repoFullName}, 'auto')
      ON CONFLICT (task_id, commit_sha, repo_full_name) DO NOTHING
    `;
  }

  return tasks;
}

export async function getTasksForCommit(
  projectId: string,
  repoFullName: string,
  commit: GitHubCommit
): Promise<Task[]> {
  const existing = await sql<Task[]>`
    SELECT t.*
    FROM task_commit_links l
    JOIN tasks t ON t.id = l.task_id
    WHERE l.repo_full_name = ${repoFullName}
      AND l.commit_sha = ${commit.sha}
  `;

  if (existing.length > 0) {
    return existing;
  }

  // No existing links: try to auto-link based on commit message
  return autoLinkCommitToTasks(projectId, repoFullName, commit);
}

export async function getVersionsForCommit(
  repoFullName: string,
  commitSha: string
): Promise<ProjectVersion[]> {
  const rows = await sql<ProjectVersion[]>`
    SELECT v.*
    FROM project_version_commits pvc
    JOIN project_versions v ON v.id = pvc.project_version_id
    WHERE pvc.repo_full_name = ${repoFullName}
      AND pvc.commit_sha = ${commitSha}
    ORDER BY v.created_at DESC
  `;

  return rows;
}

export async function getCommitRelationsForProject(
  projectId: string,
  repoUrl: string,
  commits: GitHubCommit[]
): Promise<CommitRelations> {
  const repoFullName = getRepoFullNameFromUrl(repoUrl);
  const tasksBySha: Record<string, Task[]> = {};
  const versionsBySha: Record<string, ProjectVersion[]> = {};

  if (!repoFullName || commits.length === 0) {
    return { tasksBySha, versionsBySha, repoFullName };
  }

  for (const commit of commits) {
    const [tasks, versions] = await Promise.all([
      getTasksForCommit(projectId, repoFullName, commit),
      getVersionsForCommit(repoFullName, commit.sha),
    ]);

    if (tasks.length > 0) {
      tasksBySha[commit.sha] = tasks;
    }
    if (versions.length > 0) {
      versionsBySha[commit.sha] = versions;
    }
  }

  return { tasksBySha, versionsBySha, repoFullName };
}

export async function attachCommitToVersion(
  projectVersionId: string,
  repoFullName: string,
  commitSha: string
): Promise<void> {
  await sql`
    INSERT INTO project_version_commits (project_version_id, commit_sha, repo_full_name)
    VALUES (${projectVersionId}, ${commitSha}, ${repoFullName})
    ON CONFLICT (project_version_id, commit_sha, repo_full_name) DO NOTHING
  `;
}

export async function detachCommitFromVersion(
  projectVersionId: string,
  repoFullName: string,
  commitSha: string
): Promise<void> {
  await sql`
    DELETE FROM project_version_commits
    WHERE project_version_id = ${projectVersionId}
      AND commit_sha = ${commitSha}
      AND repo_full_name = ${repoFullName}
  `;
}

export async function getCommitLinksForVersion(
  projectVersionId: string
): Promise<ProjectVersionCommitLink[]> {
  const rows = await sql<ProjectVersionCommitLink[]>`
    SELECT *
    FROM project_version_commits
    WHERE project_version_id = ${projectVersionId}
    ORDER BY created_at DESC
  `;

  return rows;
}
