import "dotenv/config";
import { sql } from "@/lib/db";

async function migrateGithubCommitCache() {
    console.log("Starting GitHub commit cache migration...");

    try {
        await sql`
      CREATE TABLE IF NOT EXISTS github_commit_cache (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        repo_full_name TEXT NOT NULL,
        branch TEXT NOT NULL,
        commits JSONB NOT NULL,
        fetched_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (repo_full_name, branch)
      );
    `;

        console.log("GitHub commit cache migration completed successfully.");
    } catch (error) {
        console.error("GitHub commit cache migration failed:", error);
        process.exit(1);
    }
}

migrateGithubCommitCache();
