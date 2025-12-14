import { getTasks } from "@/lib/tasks";
import { sql } from "@/lib/db";
import { TasksClient } from "./TasksClient";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
    const tasks = await getTasks();

    // Fetch projects for the dropdown
    const projects = await sql`SELECT id, name, workflow FROM projects ORDER BY name ASC`;

    // Fetch all sections
    const { getAllSections } = await import("@/lib/sections");
    const sections = await getAllSections();

    return <TasksClient initialTasks={tasks} projects={projects as any} sections={sections} />;
}
