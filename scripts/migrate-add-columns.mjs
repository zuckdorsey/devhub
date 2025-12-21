import { neon } from '@neondatabase/serverless';
import 'dotenv/config';

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
    try {
        console.log('Running migration...');

        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE`;
        console.log('✓ Added start_date');

        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE`;
        console.log('✓ Added end_date');

        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS image_url TEXT`;
        console.log('✓ Added image_url');

        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS documentation_links TEXT[] DEFAULT ARRAY[]::TEXT[]`;
        console.log('✓ Added documentation_links');

        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS vercel_project_id TEXT`;
        console.log('✓ Added vercel_project_id');

        await sql`ALTER TABLE projects ADD COLUMN IF NOT EXISTS workflow JSONB`;
        console.log('✓ Added workflow');

        console.log('\n🎉 Migration complete!');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exit(1);
    }
}

migrate();
