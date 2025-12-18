import { neon } from "@neondatabase/serverless";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

const sql = neon(process.env.DATABASE_URL!);

async function addDueDateToIssues() {
    console.log("Adding due_date column to issues table...");

    // Add column if not exists (safe migration)
    await sql`
    ALTER TABLE issues 
    ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE
  `;

    console.log("Migration completed successfully!");
}

addDueDateToIssues()
    .then(() => process.exit(0))
    .catch((err) => {
        console.error("Migration failed:", err);
        process.exit(1);
    });
