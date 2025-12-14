import { neon } from '@neondatabase/serverless';
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error("DATABASE_URL is not set");
    process.exit(1);
}

const sql = neon(databaseUrl);

async function run() {
    try {
        console.log("Starting Vercel integration migration...");

        await sql`
            ALTER TABLE projects 
            ADD COLUMN IF NOT EXISTS vercel_project_id VARCHAR(100);
        `;

        console.log("Migration completed successfully.");
    } catch (error) {
        console.error("Migration failed:", error);
        process.exit(1);
    }
}

run();
