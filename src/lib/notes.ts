import { sql } from "@/lib/db";

export interface Note {
    id: string;
    title: string;
    content: string | null;
    tags: string[] | null;
    is_favorite: boolean;
    created_at: string;
    updated_at: string;
}

export async function getNotes(search?: string, tag?: string): Promise<Note[]> {
    try {
        const notes = await sql`SELECT * FROM notes ORDER BY is_favorite DESC, updated_at DESC`;
        let filtered = notes as Note[];

        if (search) {
            const lowerSearch = search.toLowerCase();
            filtered = filtered.filter(n =>
                n.title.toLowerCase().includes(lowerSearch) ||
                (n.content && n.content.toLowerCase().includes(lowerSearch))
            );
        }

        if (tag) {
            filtered = filtered.filter(n => n.tags && n.tags.includes(tag));
        }

        return filtered;
    } catch (error) {
        console.error("Error fetching notes:", error);
        return [];
    }
}

export async function getNoteById(id: string): Promise<Note | null> {
    try {
        const [note] = await sql`SELECT * FROM notes WHERE id = ${id}`;
        return note as Note;
    } catch (error) {
        console.error("Error fetching note:", error);
        return null;
    }
}

export async function createNote(data: { title: string; content?: string; tags?: string[] }): Promise<Note> {
    try {
        const [note] = await sql`
      INSERT INTO notes (title, content, tags)
      VALUES (${data.title}, ${data.content || ''}, ${data.tags || []})
      RETURNING *
    `;
        return note as Note;
    } catch (error) {
        console.error("Error creating note:", error);
        throw error;
    }
}

export async function updateNote(id: string, data: { title?: string; content?: string; tags?: string[]; is_favorite?: boolean }): Promise<Note> {
    try {
        const [note] = await sql`
      UPDATE notes
      SET 
        title = COALESCE(${data.title || null}, title),
        content = COALESCE(${data.content || null}, content),
        tags = COALESCE(${data.tags || null}, tags),
        is_favorite = COALESCE(${data.is_favorite === undefined ? null : data.is_favorite}, is_favorite),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ${id}
      RETURNING *
    `;
        return note as Note;
    } catch (error) {
        console.error("Error updating note:", error);
        throw error;
    }
}

export async function deleteNote(id: string): Promise<void> {
    try {
        await sql`DELETE FROM notes WHERE id = ${id}`;
    } catch (error) {
        console.error("Error deleting note:", error);
        throw error;
    }
}
