"use server";

import { createTask, updateTask, deleteTask } from "@/lib/tasks";
import { revalidatePath } from "next/cache";
import { getProjectById } from "@/lib/projects";
import { closeIssue, createIssue } from "@/lib/github";
import { sendWhatsAppMessage, getWhatsAppSettings } from "@/lib/whatsapp";

export async function createTaskAction(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "Todo" | "In Progress" | "Done";
    const priority = formData.get("priority") as "Low" | "Medium" | "High" | "Critical";
    const start_time = formData.get("start_time") as string;
    const due_date = formData.get("due_date") as string;
    const raw_project_id = formData.get("project_id") as string | null;
    const raw_section_id = formData.get("section_id") as string | null;

    if (!title || !status || !priority) {
        throw new Error("Missing required fields");
    }

    const project_id = raw_project_id && raw_project_id !== "none" ? raw_project_id : undefined;
    const section_id = raw_section_id && raw_section_id !== "none" ? raw_section_id : undefined;

    const parseDate = (value: string | null) => {
        if (!value) return undefined;
        try {
            const d = new Date(value);
            return isNaN(d.getTime()) ? undefined : d.toISOString();
        } catch {
            return undefined;
        }
    };

    await createTask({
        title,
        description,
        status,
        priority,
        start_time: parseDate(start_time),
        due_date: parseDate(due_date),
        project_id,
        section_id,
    });

    revalidatePath("/tasks");
    if (project_id) {
        revalidatePath(`/projects/${project_id}`);
    }
}

export async function updateTaskAction(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "Todo" | "In Progress" | "Done";
    const priority = formData.get("priority") as "Low" | "Medium" | "High" | "Critical";
    const start_time = formData.get("start_time") as string;
    const due_date = formData.get("due_date") as string;
    const raw_project_id = formData.get("project_id") as string | null;
    const raw_section_id = formData.get("section_id") as string | null;

    const project_id = raw_project_id && raw_project_id !== "none" ? raw_project_id : undefined;
    const section_id = raw_section_id && raw_section_id !== "none" ? raw_section_id : undefined;

    const parseDate = (value: string | null) => {
        if (!value) return undefined;
        try {
            const d = new Date(value);
            return isNaN(d.getTime()) ? undefined : d.toISOString();
        } catch {
            console.error("Invalid date format:", value);
            return undefined;
        }
    };

    const updatedTask = await updateTask(id, {
        title,
        description,
        status,
        priority,
        start_time: parseDate(start_time),
        due_date: parseDate(due_date),
        project_id,
        section_id,
    });

    // Check if task is done and has a GitHub issue number
    console.log("Update Task Action - Status:", status);
    console.log("Update Task Action - Task:", {
        id: updatedTask.id,
        issue: updatedTask.github_issue_number,
        project: updatedTask.project_id
    });

    if (status === "Done" && updatedTask.github_issue_number && updatedTask.project_id) {
        try {
            console.log("Attempting to close GitHub issue...");
            // We need to fetch the project to get the repo owner and name
            const project = await getProjectById(updatedTask.project_id);
            console.log("Fetched Project:", project ? { id: project.id, repo: project.github_repo } : "null");

            // Close issue on GitHub if it exists
            if (updatedTask.github_issue_number && project && project.github_repo) {
                try {
                    const url = new URL(project.github_repo);
                    const pathParts = url.pathname.split("/").filter(Boolean);
                    if (pathParts.length >= 2) {
                        const [owner, repo] = pathParts;
                        console.log(`Closing issue #${updatedTask.github_issue_number} in ${owner}/${repo}`);
                        await closeIssue(owner, repo, updatedTask.github_issue_number);
                        console.log("Successfully closed GitHub issue");
                    } else {
                        console.log("Invalid GitHub URL format for project:", project.github_repo);
                    }
                } catch (error) {
                    console.error("Failed to close GitHub issue:", error);
                }
            } else {
                console.log("GitHub sync conditions not met (no issue number or project repo)");
            }

            // Send WhatsApp notification
            if (project) { // Ensure project is fetched before trying to use its name
                try {
                    const { target } = await getWhatsAppSettings();
                    if (target) {
                        const message = `*Task Completed* ✅\n\nTask: ${updatedTask.title}\nProject: ${project.name}\n\nGood job! 🚀`;
                        await sendWhatsAppMessage(target, message);
                        console.log("Successfully sent WhatsApp notification");
                    } else {
                        console.log("WhatsApp target not configured, skipping notification.");
                    }
                } catch (error) {
                    console.error("Failed to send WhatsApp notification:", error);
                }
            } else {
                console.log("Project not found, skipping WhatsApp notification.");
            }

        } catch (error) {
            console.error("Error during task completion actions:", error);
            // Don't fail the task update if GitHub/WhatsApp sync fails
        }
    } else {
        console.log("Sync conditions not met");
    }

    revalidatePath("/tasks");
    if (project_id) {
        revalidatePath(`/projects/${project_id}`);
    }
}

export async function deleteTaskAction(id: string) {
    // We need to get the task before deleting to know which project to revalidate
    // Ideally we should have a getTaskById function exposed or pass project_id
    // For now, let's just revalidate /tasks. 
    // Wait, we can import getTaskById if available.
    // Let's check if getTaskById is available in lib/tasks.ts
    // It seems deleteTask returns void or the deleted task? 
    // The lib/tasks.ts deleteTask returns Promise<void>.
    // So we can't know the project_id easily unless we fetch it first.

    // Let's fetch it first.
    const { getTaskById } = await import("@/lib/tasks");
    const task = await getTaskById(id);

    await deleteTask(id);
    revalidatePath("/tasks");
    if (task && task.project_id) {
        revalidatePath(`/projects/${task.project_id}`);
    }
}
