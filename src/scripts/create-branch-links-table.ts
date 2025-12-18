import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sql = neon(process.env.DATABASE_URL!);

async function createTaskBranchLinksTable() {
    console.log("Creating task_branch_links table...");

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

    console.log("task_branch_links table created successfully!");
}

createTaskBranchLinksTable()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Migration failed:", err);
        process.exit(1);
    });
