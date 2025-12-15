import "dotenv/config";
import { sql } from "@/lib/db";

async function migrateTasksTime() {
    console.log("Starting tasks time migration...");

    try {
        console.log("Adding start_time column if it does not exist...");
        await sql`
      ALTER TABLE tasks
      ADD COLUMN IF NOT EXISTS start_time TIMESTAMPTZ;
    `;

        console.log("Dropping obsolete type column if it exists...");
        await sql`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1
          FROM information_schema.columns
          WHERE table_name = 'tasks' AND column_name = 'type'
        ) THEN
          ALTER TABLE tasks DROP COLUMN type;
        END IF;
      END $$;
    `;

        console.log("Tasks time migration completed successfully.");
    } catch (error) {
        console.error("Tasks time migration failed:", error);
        process.exit(1);
    }
}

migrateTasksTime();
