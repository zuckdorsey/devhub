import "dotenv/config";
import { sql } from "@/lib/db";

async function migrateHierarchy() {
    console.log("Starting hierarchy migration...");

    try {
        // 1. Create sections table
        console.log("Creating sections table...");
        await sql`
      CREATE TABLE IF NOT EXISTS sections (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // 2. Create subtasks table
        console.log("Creating subtasks table...");
        await sql`
      CREATE TABLE IF NOT EXISTS subtasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        is_completed BOOLEAN DEFAULT FALSE,
        order_index INTEGER DEFAULT 0,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `;

        // 3. Add section_id to tasks table
        console.log("Adding section_id to tasks table...");
        // Check if column exists first to avoid errors on re-run
        const [columnExists] = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'section_id'
    `;

        if (!columnExists) {
            await sql`
        ALTER TABLE tasks 
        ADD COLUMN section_id UUID REFERENCES sections(id) ON DELETE SET NULL
      `;
            console.log("Added section_id column.");
        } else {
            console.log("section_id column already exists.");
        }

        console.log("Hierarchy migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

migrateHierarchy();
