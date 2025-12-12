import { getTasks } from "@/lib/tasks";
import { sql } from "@/lib/db";
import { TasksClient } from "./TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
    const tasks = await getTasks();

    // Fetch projects for the dropdown
    const projects = await sql`SELECT id, name FROM projects ORDER BY name ASC`;

    return <TasksClient initialTasks={tasks} projects={projects as any} />;
}
