import { config } from 'dotenv';
import { resolve } from 'path';
import { Client } from 'pg';

// Load environment variables
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

async function migrateNotes() {
    console.log('Starting migration for notes table...');

    const databaseUrl = process.env.DATABASE_URL;

    if (!databaseUrl) {
        console.error('Error: DATABASE_URL is missing in .env file.');
        process.exit(1);
    }

    const client = new Client({ connectionString: databaseUrl });

    try {
        await client.connect();
        console.log('Connected to database.');

        const createTableSql = `
      CREATE TABLE IF NOT EXISTS notes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT,
        tags TEXT[],
        is_favorite BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;

        await client.query(createTableSql);
        console.log('Notes table created successfully.');

    } catch (err) {
        console.error('Error during migration:', err);
        process.exit(1);
    } finally {
        await client.end();
        console.log('Database connection closed.');
    }
}

migrateNotes().catch(console.error);
