import { config } from 'dotenv';
import { resolve } from 'path';
import fs from 'fs';
import { Client } from 'pg';

// Load environment variables from .env.local or .env
config({ path: resolve(process.cwd(), '.env.local') });
config({ path: resolve(process.cwd(), '.env') });

import { projects } from '../data/mockData';

async function seed() {
  console.log('Starting seed process for Neon database...');
  
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL is missing in .env file.');
    console.error('Please add your Neon connection string to .env');
    console.error('Example: DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"');
    process.exit(1);
  }

  // Create connection client
  console.log('Connecting to Neon database...');
  const client = new Client({ connectionString: databaseUrl });
  
  try {
    await client.connect();
    console.log('Connected successfully!');
    
    // 1. Create table from schema
    const schemaPath = resolve(process.cwd(), 'neon/schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('Creating table and indexes...');
    await client.query(schemaSql);
    console.log('Schema applied successfully.');
    
    // 2. Insert mock data
    console.log('Seeding projects...');
    
    for (const project of projects) {
      await client.query(
        `INSERT INTO projects (name, status, tech_stack, description, created_at)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          project.name,
          project.status,
          project.tech_stack,
          project.description || null,
          new Date().toISOString()
        ]
      );
    }
    
    console.log(`Successfully seeded ${projects.length} projects.`);
    
    // 3. Verify insertion
    const { rows } = await client.query('SELECT COUNT(*) as count FROM projects');
    console.log(`Total projects in database: ${rows[0].count}`);
    
  } catch (err) {
    console.error('Error during seed process:', err);
    process.exit(1);
  } finally {
    await client.end();
    console.log('Database connection closed.');
  }
}

seed().catch(console.error);
