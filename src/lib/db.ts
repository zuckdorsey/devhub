import { neon } from '@neondatabase/serverless';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('Warning: DATABASE_URL environment variable is not set. Database operations will fail.');
}

export const sql = databaseUrl ? neon(databaseUrl) : (async () => { throw new Error('DATABASE_URL is not set'); }) as any;
