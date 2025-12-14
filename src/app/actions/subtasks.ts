"use server";

import { createSubtask, deleteSubtask, toggleSubtask, updateSubtask } from "@/lib/subtasks";
import { revalidatePath } from "next/cache";

export async function createSubtaskAction(formData: FormData) {
    const task_id = formData.get("task_id") as string;
    const title = formData.get("title") as string;
    const project_id = formData.get("project_id") as string; // Needed for revalidation

    if (!task_id || !title) {
        throw new Error("Missing required fields");
    }

    await createSubtask({
        task_id,
        title,
    });

    try {
        if (project_id) {
            revalidatePath(`/projects/${project_id}`);
        } else {
            revalidatePath("/tasks"); // Fallback if viewed in global tasks list
        }
    } catch (error) {
        console.warn("revalidatePath failed:", error);
    }
}

export async function updateSubtaskAction(id: string, projectId: string | undefined, formData: FormData) {
    const title = formData.get("title") as string;

    await updateSubtask(id, {
        title: title || undefined,
    });

    try {
        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        } else {
            revalidatePath("/tasks");
        }
    } catch (error) {
        console.warn("revalidatePath failed:", error);
    }
}

export async function deleteSubtaskAction(id: string, projectId: string | undefined) {
    await deleteSubtask(id);

    try {
        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        } else {
            revalidatePath("/tasks");
        }
    } catch (error) {
        console.warn("revalidatePath failed:", error);
    }
}

export async function toggleSubtaskAction(id: string, projectId: string | undefined) {
    await toggleSubtask(id);

    try {
        if (projectId) {
            revalidatePath(`/projects/${projectId}`);
        } else {
            revalidatePath("/tasks");
        }
    } catch (error) {
        console.warn("revalidatePath failed:", error);
    }
}

export async function fetchSubtasksAction(taskId: string) {
    const { getSubtasks } = await import("@/lib/subtasks");
    return await getSubtasks(taskId);
}
