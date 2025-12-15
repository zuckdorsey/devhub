import "dotenv/config";
import { sql } from "@/lib/db";

async function migrateCommitLinks() {
  console.log("Starting commit links migration...");

  try {
    await sql`
      CREATE TABLE IF NOT EXISTS task_commit_links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        commit_sha TEXT NOT NULL,
        repo_full_name TEXT NOT NULL,
        source VARCHAR(20) NOT NULL DEFAULT 'auto' CHECK (source IN ('auto', 'manual')),
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (task_id, commit_sha, repo_full_name)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS project_version_commits (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_version_id UUID NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
        commit_sha TEXT NOT NULL,
        repo_full_name TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (project_version_id, commit_sha, repo_full_name)
      );
    `;

    console.log("Commit links migration completed successfully.");
  } catch (error) {
    console.error("Commit links migration failed:", error);
    process.exit(1);
  }
}

migrateCommitLinks();
