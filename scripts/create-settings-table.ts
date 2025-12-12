import { sql } from "../src/lib/db";

async function main() {
    console.log("Creating settings table...");
    try {
        await sql`
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
      );
    `;
        console.log("Settings table created successfully.");
    } catch (error) {
        console.error("Error creating settings table:", error);
    }
}

main();
