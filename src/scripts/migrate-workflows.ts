import "dotenv/config";
import { sql } from "@/lib/db";

async function migrateWorkflows() {
    console.log("Starting workflow migration...");
    try {
        // 1. Add workflow column if it doesn't exist
        await sql`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS workflow JSONB;
        `;

        // Drop status check constraint on tasks table
        await sql`
            ALTER TABLE tasks 
            DROP CONSTRAINT IF EXISTS tasks_status_check;
        `;
        console.log("Added workflow column to projects table.");

        // 2. Define legacy workflow (for existing projects)
        const legacyWorkflow = [
            { id: "todo", name: "Todo", color: "gray", type: "unstarted" },
            { id: "in-progress", name: "In Progress", color: "blue", type: "started" },
            { id: "done", name: "Done", color: "green", type: "completed" }
        ];

        // 3. Update existing projects to have the legacy workflow
        await sql`
            UPDATE projects 
            SET workflow = ${JSON.stringify(legacyWorkflow)}::jsonb;
        `;
        console.log("Updated existing projects with legacy workflow.");

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateWorkflows();
