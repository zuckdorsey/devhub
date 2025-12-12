import { sql } from "@/lib/db";
import dotenv from "dotenv";

dotenv.config();

async function checkColumns() {
    try {
        console.log("Checking columns for tasks table...");
        const columns = await sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'tasks';
    `;
        console.log("Columns:", columns);
    } catch (error) {
        console.error("Failed to check columns:", error);
    }
}

checkColumns();
