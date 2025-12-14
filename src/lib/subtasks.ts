import { sql } from "@/lib/db";

export type Subtask = {
    id: string;
    task_id: string;
    title: string;
    is_completed: boolean;
    order_index: number;
    created_at: string;
};

export async function getSubtasks(taskId: string): Promise<Subtask[]> {
    try {
        const subtasks = await sql`
      SELECT * FROM subtasks 
      WHERE task_id = ${taskId}
      ORDER BY order_index ASC
    `;
        return subtasks as Subtask[];
    } catch (error) {
        console.error("Error fetching subtasks:", error);
        return [];
    }
}

export async function createSubtask(data: {
    task_id: string;
    title: string;
    order_index?: number;
}): Promise<Subtask> {
    try {
        const [subtask] = await sql`
      INSERT INTO subtasks (task_id, title, order_index)
      VALUES (${data.task_id}, ${data.title}, ${data.order_index || 0})
      RETURNING *
    `;
        return subtask as Subtask;
    } catch (error) {
        console.error("Error creating subtask:", error);
        throw error;
    }
}

export async function updateSubtask(
    id: string,
    data: { title?: string; is_completed?: boolean; order_index?: number }
): Promise<Subtask> {
    try {
        const [subtask] = await sql`
      UPDATE subtasks
      SET 
        title = COALESCE(${data.title || null}, title),
        is_completed = COALESCE(${data.is_completed !== undefined ? data.is_completed : null}, is_completed),
        order_index = COALESCE(${data.order_index !== undefined ? data.order_index : null}, order_index)
      WHERE id = ${id}
      RETURNING *
    `;
        return subtask as Subtask;
    } catch (error) {
        console.error("Error updating subtask:", error);
        throw error;
    }
}

export async function deleteSubtask(id: string): Promise<void> {
    try {
        await sql`DELETE FROM subtasks WHERE id = ${id}`;
    } catch (error) {
        console.error("Error deleting subtask:", error);
        throw error;
    }
}

export async function toggleSubtask(id: string): Promise<Subtask> {
    try {
        const [subtask] = await sql`
      UPDATE subtasks
      SET is_completed = NOT is_completed
      WHERE id = ${id}
      RETURNING *
    `;
        return subtask as Subtask;
    } catch (error) {
        console.error("Error toggling subtask:", error);
        throw error;
    }
}
