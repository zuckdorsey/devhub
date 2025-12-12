"use server";

import { createTask, updateTask, deleteTask } from "@/lib/tasks";
import { revalidatePath } from "next/cache";
import { getProjectById } from "@/lib/projects";
import { closeIssue } from "@/lib/github";

export async function createTaskAction(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "Todo" | "In Progress" | "Done";
    const type = formData.get("type") as "Daily" | "Weekly";
    const priority = formData.get("priority") as "Low" | "Medium" | "High" | "Critical";
    const due_date = formData.get("due_date") as string;
    const project_id = formData.get("project_id") as string;

    if (!title || !status || !type || !priority) {
        throw new Error("Missing required fields");
    }

    await createTask({
        title,
        description,
        status,
        type,
        priority,
        due_date: due_date || undefined,
        project_id: project_id || undefined,
    });

    revalidatePath("/tasks");
}

export async function updateTaskAction(id: string, formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const status = formData.get("status") as "Todo" | "In Progress" | "Done";
    const type = formData.get("type") as "Daily" | "Weekly";
    const priority = formData.get("priority") as "Low" | "Medium" | "High" | "Critical";
    const due_date = formData.get("due_date") as string;
    const project_id = formData.get("project_id") as string;

    let formattedDueDate = undefined;
    if (due_date) {
        try {
            const date = new Date(due_date);
            if (!isNaN(date.getTime())) {
                formattedDueDate = date.toISOString();
            }
        } catch (e) {
            console.error("Invalid date format:", due_date);
        }
    }

    const updatedTask = await updateTask(id, {
        title,
        description,
        status,
        type,
        priority,
        due_date: formattedDueDate,
        project_id: project_id || undefined,
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

            if (project && project.github_repo) {
                const url = new URL(project.github_repo);
                const pathParts = url.pathname.split("/").filter(Boolean);
                if (pathParts.length >= 2) {
                    const [owner, repo] = pathParts;
                    console.log(`Closing issue #${updatedTask.github_issue_number} in ${owner}/${repo}`);
                    await closeIssue(owner, repo, updatedTask.github_issue_number);
                    console.log("Successfully closed GitHub issue");
                } else {
                    console.log("Invalid GitHub URL format");
                }
            } else {
                console.log("Project has no GitHub repo linked");
            }
        } catch (error) {
            console.error("Failed to close GitHub issue:", error);
            // Don't fail the task update if GitHub sync fails
        }
    } else {
        console.log("Sync conditions not met");
    }

    revalidatePath("/tasks");
}

export async function deleteTaskAction(id: string) {
    await deleteTask(id);
    revalidatePath("/tasks");
}
