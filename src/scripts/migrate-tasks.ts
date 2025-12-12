import dotenv from "dotenv";

dotenv.config();

async function run() {
    try {
        console.log("Starting migration...");
        console.log("Database URL present:", !!process.env.DATABASE_URL);

        // Dynamic import to ensure env vars are loaded first
        const { sql } = await import("@/lib/db");

        console.log("Adding github_issue_number column to tasks table...");
        await sql`
      ALTER TABLE tasks 
      ADD COLUMN IF NOT EXISTS github_issue_number INTEGER;
    `;
        console.log("Migration completed successfully.");

        // Verify
        const columns = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'tasks' AND column_name = 'github_issue_number';
    `;
        console.log("Verification:", columns);

    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

run();
