import { sql } from "@/lib/db";

export async function getSetting(key: string): Promise<string | null> {
    try {
        const [setting] = await sql`
      SELECT value FROM settings WHERE key = ${key}
    `;
        return setting?.value || null;
    } catch (error) {
        console.error(`Error fetching setting ${key}:`, error);
        return null;
    }
}

export async function saveSetting(key: string, value: string): Promise<void> {
    try {
        await sql`
      INSERT INTO settings (key, value, updated_at)
      VALUES (${key}, ${value}, NOW())
      ON CONFLICT (key) 
      DO UPDATE SET value = ${value}, updated_at = NOW()
    `;
    } catch (error) {
        console.error(`Error saving setting ${key}:`, error);
        throw error;
    }
}
