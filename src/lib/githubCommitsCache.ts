import { sql } from "@/lib/db";
import { GitHubCommit } from "@/lib/github";

export interface CachedCommit {
    sha: string;
    message: string;
    author: string;
    date: string;
}

interface CommitCacheRow {
    id: string;
    repo_full_name: string;
    branch: string;
    commits: CachedCommit[];
    fetched_at: string;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

export async function getCachedCommits(repoFullName: string, branch: string): Promise<CachedCommit[] | null> {
    const rows = await sql<CommitCacheRow[]>`
      SELECT id, repo_full_name, branch, commits, fetched_at
      FROM github_commit_cache
      WHERE repo_full_name = ${repoFullName} AND branch = ${branch}
      LIMIT 1
    `;

    if (!rows || rows.length === 0) return null;

    const row = rows[0];
    const age = Date.now() - new Date(row.fetched_at).getTime();
    if (age > CACHE_TTL_MS) {
        // Stale cache
        return null;
    }

    return row.commits;
}

export async function getCachedCommitsMap(
    repoFullName: string,
    branch: string
): Promise<Record<string, CachedCommit>> {
    const commits = await getCachedCommits(repoFullName, branch);
    const map: Record<string, CachedCommit> = {};
    if (!commits) return map;
    for (const c of commits) {
        map[c.sha] = c;
    }
    return map;
}

export async function saveCachedCommits(
    repoFullName: string,
    branch: string,
    commits: CachedCommit[]
): Promise<void> {
    await sql`
      INSERT INTO github_commit_cache (repo_full_name, branch, commits, fetched_at)
      VALUES (${repoFullName}, ${branch}, ${JSON.stringify(commits)}, NOW())
      ON CONFLICT (repo_full_name, branch)
      DO UPDATE SET
        commits = EXCLUDED.commits,
        fetched_at = EXCLUDED.fetched_at
    `;
}

export function mapCommitsToCached(commits: GitHubCommit[]): CachedCommit[] {
    return commits.map((commit) => ({
        sha: commit.sha,
        message: commit.commit?.message || "",
        author: commit.commit?.author?.name || commit.author?.login || "Unknown",
        date: commit.commit?.author?.date || "",
    }));
}
