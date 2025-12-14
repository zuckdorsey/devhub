import { sql } from "@/lib/db";

export type Task = {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  status: string;
  type: "Daily" | "Weekly";
  priority: "Low" | "Medium" | "High" | "Critical";
  due_date: string | null;
  project_id: string | null;
  project_name?: string; // For display purposes
  github_issue_number?: number | null;
  section_id?: string | null;
  subtask_count?: number;
  completed_subtask_count?: number;
};

export async function getTasks(): Promise<Task[]> {
  try {
    const tasks = await sql`
      SELECT 
        t.*, 
        p.name as project_name,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = true) as completed_subtask_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      ORDER BY 
        CASE 
          WHEN t.status = 'Todo' THEN 1 
          WHEN t.status = 'In Progress' THEN 2 
          WHEN t.status = 'Done' THEN 3 
        END,
        t.due_date ASC
    `;
    return tasks as Task[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
}

export async function getTasksByType(type: "Daily" | "Weekly"): Promise<Task[]> {
  try {
    const tasks = await sql`
      SELECT 
        t.*, 
        p.name as project_name,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = true) as completed_subtask_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.type = ${type}
      ORDER BY 
        CASE 
          WHEN t.status = 'Todo' THEN 1 
          WHEN t.status = 'In Progress' THEN 2 
          WHEN t.status = 'Done' THEN 3 
        END,
        t.due_date ASC
    `;
    return tasks as Task[];
  } catch (error) {
    console.error("Error fetching tasks by type:", error);
    throw error;
  }
}

export async function getTasksByProjectId(projectId: string): Promise<Task[]> {
  try {
    const tasks = await sql`
      SELECT 
        t.*, 
        p.name as project_name,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = true) as completed_subtask_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.project_id = ${projectId}
      ORDER BY 
        CASE 
          WHEN t.status = 'Todo' THEN 1 
          WHEN t.status = 'In Progress' THEN 2 
          WHEN t.status = 'Done' THEN 3 
        END,
        t.due_date ASC
    `;
    return tasks as Task[];
  } catch (error) {
    console.error("Error fetching tasks by project id:", error);
    throw error;
  }
}

export async function getTaskById(id: string): Promise<Task | null> {
  try {
    const [task] = await sql`
      SELECT 
        t.*, 
        p.name as project_name,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id) as subtask_count,
        (SELECT COUNT(*)::int FROM subtasks s WHERE s.task_id = t.id AND s.is_completed = true) as completed_subtask_count
      FROM tasks t
      LEFT JOIN projects p ON t.project_id = p.id
      WHERE t.id = ${id}
    `;
    return (task as Task) || null;
  } catch (error) {
    console.error("Error fetching task by id:", error);
    throw error;
  }
}

export async function createTask(data: {
  title: string;
  description?: string;
  status?: string;
  type: "Daily" | "Weekly";
  priority: "Low" | "Medium" | "High" | "Critical";
  due_date?: string;
  project_id?: string;
  github_issue_number?: number;
  section_id?: string;
}): Promise<Task> {
  try {
    const [task] = await sql`
      INSERT INTO tasks (
        title, description, status, type, priority, due_date, project_id, github_issue_number, section_id
      ) VALUES (
        ${data.title},
        ${data.description || null},
        ${data.status},
        ${data.type},
        ${data.priority},
        ${data.due_date || null},
        ${data.project_id || null},
        ${data.github_issue_number || null},
        ${data.section_id || null}
      )
      RETURNING *
    `;
    return task as Task;
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
}

export async function updateTask(
  id: string,
  data: {
    title?: string;
    description?: string;
    status: string;
    type?: "Daily" | "Weekly";
    priority?: "Low" | "Medium" | "High" | "Critical";
    due_date?: string;
    project_id?: string;
    github_issue_number?: number;
    section_id?: string;
  }
): Promise<Task> {
  try {
    const [task] = await sql`
      UPDATE tasks
      SET 
        title = COALESCE(${data.title || null}, title),
        description = COALESCE(${data.description || null}, description),
        status = COALESCE(${data.status || null}, status),
        type = COALESCE(${data.type || null}, type),
        priority = COALESCE(${data.priority || null}, priority),
        due_date = COALESCE(${data.due_date || null}, due_date),
        project_id = COALESCE(${data.project_id || null}, project_id),
        github_issue_number = COALESCE(${data.github_issue_number || null}, github_issue_number),
        section_id = COALESCE(${data.section_id || null}, section_id)
      WHERE id = ${id}
      RETURNING *
    `;
    return task as Task;
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
}

export async function deleteTask(id: string): Promise<void> {
  try {
    await sql`DELETE FROM tasks WHERE id = ${id}`;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
}
