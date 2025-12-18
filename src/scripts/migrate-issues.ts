import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sql = neon(process.env.DATABASE_URL!);

async function migrateIssues() {
  console.log("Creating issues table...");

  await sql`
    CREATE TABLE IF NOT EXISTS issues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      title VARCHAR(255) NOT NULL,
      description TEXT,
      status VARCHAR(20) NOT NULL CHECK (status IN ('open', 'closed')) DEFAULT 'open',
      priority VARCHAR(20) CHECK (priority IN ('Low', 'Medium', 'High', 'Critical')) DEFAULT 'Medium',
      project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
      labels TEXT[] DEFAULT ARRAY[]::TEXT[],
      
      github_issue_number INTEGER,
      github_issue_url TEXT,
      github_synced_at TIMESTAMP WITH TIME ZONE,
      
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    )
  `;

  console.log("Issues table created successfully!");
}

migrateIssues()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exit(1);
  });
