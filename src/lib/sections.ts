import { sql } from "@/lib/db";

export type Section = {
    id: string;
    project_id: string;
    name: string;
    order_index: number;
    created_at: string;
};

export async function getSections(projectId: string): Promise<Section[]> {
    try {
        const sections = await sql`
      SELECT * FROM sections 
      WHERE project_id = ${projectId}
      ORDER BY order_index ASC
    `;
        return sections as Section[];
    } catch (error) {
        console.error("Error fetching sections:", error);
        return [];
    }
}

export async function getAllSections(): Promise<Section[]> {
    try {
        const sections = await sql`
      SELECT * FROM sections 
      ORDER BY order_index ASC
    `;
        return sections as Section[];
    } catch (error) {
        console.error("Error fetching all sections:", error);
        return [];
    }
}

export async function createSection(data: {
    project_id: string;
    name: string;
    order_index?: number;
}): Promise<Section> {
    try {
        const [section] = await sql`
      INSERT INTO sections (project_id, name, order_index)
      VALUES (${data.project_id}, ${data.name}, ${data.order_index || 0})
      RETURNING *
    `;
        return section as Section;
    } catch (error) {
        console.error("Error creating section:", error);
        throw error;
    }
}

export async function updateSection(
    id: string,
    data: { name?: string; order_index?: number }
): Promise<Section> {
    try {
        const [section] = await sql`
      UPDATE sections
      SET 
        name = COALESCE(${data.name || null}, name),
        order_index = COALESCE(${data.order_index !== undefined ? data.order_index : null}, order_index)
      WHERE id = ${id}
      RETURNING *
    `;
        return section as Section;
    } catch (error) {
        console.error("Error updating section:", error);
        throw error;
    }
}

export async function deleteSection(id: string): Promise<void> {
    try {
        await sql`DELETE FROM sections WHERE id = ${id}`;
    } catch (error) {
        console.error("Error deleting section:", error);
        throw error;
    }
}
