import { sql } from "@/lib/db";

export async function migrateTaskBranchLinks() {
  console.log("Creating task_branch_links table if not exists...");

  await sql`
    CREATE TABLE IF NOT EXISTS task_branch_links (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
      repo_full_name TEXT NOT NULL,
      branch_name TEXT NOT NULL,
      source VARCHAR(20) NOT NULL DEFAULT 'manual' CHECK (source IN ('auto', 'manual')),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (task_id, repo_full_name, branch_name)
    )
  `;

  console.log("task_branch_links table migration completed.");
}

if (require.main === module) {
  migrateTaskBranchLinks()
    .then(() => {
      console.log("Migration finished.");
      process.exit(0);
    })
    .catch((err) => {
      console.error("Migration failed:", err);
      process.exit(1);
    });
}
