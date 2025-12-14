import "dotenv/config";
import { sql } from "@/lib/db";

async function checkSchema() {
    console.log("Checking schema...");
    try {
        const tasksColumns = await sql`
            SELECT column_name, data_type, udt_name
            FROM information_schema.columns
            WHERE table_name = 'tasks' AND column_name = 'status';
        `;
        console.log("Tasks status column:", tasksColumns);

        const projectsColumns = await sql`
            SELECT column_name, data_type
            FROM information_schema.columns
            WHERE table_name = 'projects';
        `;
        console.log("Projects columns:", projectsColumns);
    } catch (error) {
        console.error("Error checking schema:", error);
    }
}

checkSchema();
