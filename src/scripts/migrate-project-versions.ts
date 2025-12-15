import "dotenv/config";
import { sql } from "@/lib/db";

async function migrateProjectVersions() {
    console.log("Starting project versions migration...");

    try {
        console.log("Creating project_versions table if not exists...");
        await sql`
      CREATE TABLE IF NOT EXISTS project_versions (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      );
    `;

        console.log("Creating project_version_tasks table if not exists...");
        await sql`
      CREATE TABLE IF NOT EXISTS project_version_tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_version_id UUID NOT NULL REFERENCES project_versions(id) ON DELETE CASCADE,
        task_id UUID NOT NULL,
        project_id UUID,
        section_id UUID,
        title TEXT NOT NULL,
        description TEXT,
        status VARCHAR(50) NOT NULL,
        priority VARCHAR(20) NOT NULL,
        start_time TIMESTAMPTZ,
        due_date TIMESTAMPTZ
      );
    `;

        console.log("Project versions migration completed successfully.");
    } catch (error) {
        console.error("Project versions migration failed:", error);
        process.exit(1);
    }
}

migrateProjectVersions();
